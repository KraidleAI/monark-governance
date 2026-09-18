# ADR-M012 — Narabi en direct : sentinelle hors outil, tracker M009 alimenté par le flux attesté quotidien (D8 (i)+(ii))

- **Statut** : **proposé** (G0) — **checkpoint-1 validateur `claude-fable-5-1` 2026-09-17 : ACCEPTE-AVEC-CORRECTIONS C-1..C-14
  (foldées) + escalade investisseur TRANCHÉE le 2026-09-17 : ε = 0,1 ; option B « plus tard » ; AM-2 bis entériné**. Antériorité du pré-enregistrement D6 = date de cet avis
  (le PLAN était non suivi ; M012-a le fige a posteriori, même déclaration que F2-B — C-14). Aucune action sortante sans go.
- **Dates** : décision 2026-09-17 · approbation — (checkpoint-2 dû) · dernière modification 2026-09-17
- **Propriétaire de la décision** : investisseur (décision verbatim 2026-09-17 : « on fait i et ii, on finalise tout, la
  condition iii arrivera quand elle arrivera, on garde adaptatif. et on annonce narabi adaptatif ») ; rédaction et
  exécution : orchestrateur `claude-fable-5-1`.
- **Gate concerné** : G0 → G1/G2/G7 + checkpoints 1 et 2 ; déploiement VPS (ADR-M005 D12) ; surfaces publiques (ADR-M010).
- **Éléments affectés** : **nouveau** `apps/sentinel/` (processus hors outil, K-8) ; `scripts/usde-full-pull.mjs` (extraction du
  découpage de fenêtres en module partagé, sans changement de résultat) ; `apps/harness/src/tools/gate.ts`
  (`STABLE_RUN_COMMITTED_SENTENCE`, D7) ; `packages/hikae/src/tracker.ts:4` (en-tête, D9) ; `vocab-banned.json` (D8) ;
  `deploy/` (unité + timer systemd, bloc Caddy) ; **amende** ADR-M008 **D8** et **D7**, ADR-M009 **§10**, ADR-M005 (addendum
  seconde unité), ADR-M002 D5/D6 (item (a) : cité, pas résolu ici). **0 octet de contrat gelé ; le harnais reste pur.**
- **Roster** : worker `claude-opus-4-8` max ; G2 fraîche ; orchestrateur/validateur `claude-fable-5-1` ; advisor-defi
  2026-09-17 (avis §0-§8, memstack `9850ec7d…`, conseil cité) ; advisor intégré (squelette D-items).

## Contexte
M009 a livré le tracker (ABB 2024) comme primitive pure à état porté par l'appelant, sans consommateur. L'investisseur
décide de remplir les conditions D8 **(i)** (flux d'outcomes en direct, no-peek) et **(ii)** (accumulation de T) et
d'annoncer Narabi « adaptatif ». Contrainte non négociable : le harnais est **pur et sans état** (ADR-M005 K-8, D0, D6 :
aucune persistance, aucun appel réseau). Le direct est donc **un processus séparé**, la sentinelle, qui est *l'appelant*
qui porte l'état — exactement D8 (iv) tel que livré ; `tracker.ts` ne change pas de logique.

**Fait mesuré qui gouverne (advisor-defi §0, fixture sha `7c33027a…`)** : la population calibrée n'est **pas échangeable
dans le temps**. Taux de raté contre le q̂ statique par semestre : 2023H2 0/16 ; 2024H1 6/182 (3,3 %) ; 2024H2 23/161
(14,3 %) ; 2025H1 31/163 (19,0 %) ; 2025H2 0/91 (moyenne 0,0979 ≈ α). Test de permutation (4000 mélanges) sur le max d'un
CUSUM de Page (p₀ = 0,125, p₁ = 0,25, graine 20260917) : observé 9,54 contre q999 = 6,24, **P ≤ 1/4001** (0 dépassement) ;
rejeu indépendant du validateur (5000 mélanges, deux statistiques) : P = 8,0e-4 et 2,0e-4 — la **conclusion** est confirmée (C-11). Conséquences : la phrase publique « exchangeability is declared
within that population » est **mesurée fausse dans le temps** (D7) ; tout critère de drift fondé sur une nulle i.i.d.
tire in-sample (D6) ; une phase live ressemblant à 2025H1 n'est pas un drift nouveau mais une phase connue.

## Décision
**D1 — La sentinelle est l'appelant.** Un job quotidien `apps/sentinel/` (hors `apps/harness/src/tools/**`, scan K-8
intact ; test « aucun import depuis `tools/` ») : (1) lit `eth_blockNumber` au tag **`finalized`** et ne traite une fenêtre
que si `to_block ≤ finalized` ; (2) découpe la fenêtre UTC ancrée bloc **avec les fonctions du pull** (`daysUTC`,
`firstBlockAtOrAfter`, `pullWindow`, extraites en module partagé — 0 gap / 0 overlap mesurés sur 701 fenêtres) ; (3) tire
burns/mints/supply via un **quorum de 2 endpoints** du pool public, vérifie l'identité C1 fail-closed ; (4) construit
l'`AttestedFlow` (hash A3 comme `record-usde-calib.mjs:45`), calcule `v_t` par `fromAttestedFlow` (adaptateur déployé) ;
(5) score `s_{t−1} = clipScore(|v_t − v_{t−1}|, B)`, `B = 1/24` ; (6) `trackerStep` ; (7) persiste (D4). **Aucune clé** :
RPC publics en lecture ; aucun ancrage onchain.

**D2 — Trois consommateurs d'une seule timeline, trois filtres déclarés.** Tracker : **toutes** les paires évaluables
(Thm 1 vaut pour une suite arbitraire ; exclure = fabriquer un régime). `B_t` (informatif, l'appelant du gate porte le sien) :
toutes les paires. Drapeau (iii) : **paires calmes seulement** (règle mécanique : `S_open ≥ 1e25` et `burns/S_open < 0,01`
sur les deux fenêtres de la paire, `record-usde-calib.mjs:88-93`). Le régime est une **métadonnée** recalculable des
comptes portés, jamais un filtre du tracker. `E_tracker` vient de `trackerStep` ; `E_static = 1{s > q̂}` est calculé
directement ; **aucun** des deux ne dérive d'un `reason` de gate. L'alerte de run reste le **fait** `v_t` vs q99
(ADR-M009 §9). No-peek : `labelDelay = 1` ; l'état qui décide la fenêtre t+1 a consommé `s_1..s_{t−1}` (test).

**D3 — Le gate ne change pas.** L'endpoint sert la région **statique** (q̂ committé) tant que (iii) n'a pas tiré et qu'un
ADR n'a pas adopté la branche (a) de M002 D4. « Adaptatif » qualifie la région **trackée** publiée à côté, jamais le verdict
du gate. Phrase unique, réutilisée verbatim sur toute surface (D8).

**D4 — Persistance, publication, rejouabilité.** Timeline **JSONL append-only** par fenêtre : `day, from_block, to_block,
burns, mints, supply_close, s_open, c1_ok, utterance_hash, attested_flow_sha256, v, regime{floor, stress}, pair_status
{evaluable|non_evaluable|clipped}, s_raw, s, E_tracker, q_before, eta, q_after, T, mean_E_tracker, bound_thm1, digest_T,
E_static, t_deg, sum_E_static, B_t, rolling90_calm_miss, prev_line_hash, endpoints, node_version, sentinel_sha` ; plus
`state.json` (= `TrackerState` + `digest` + date projetée `T(bound ≤ δ_target)`). **Chaîne de hash par ligne** (fait +
score + état + `prev_line_hash`) : une réécriture est **détectable**, jamais certifiée ; **le seul garant des faits est le
recompute onchain** (`[from_block, to_block]` ⇒ `eth_getLogs` + `totalSupply`) et `trackerReplay(q₁, params, s)` reproduit
`q_{T+1}`. **Canal : option A** — fichiers statiques sur le VPS servis par Caddy sous **`monarkgate.tech/narabi/`**
(`state.json`, `timeline.jsonl`), écrits par la sentinelle dans son propre répertoire (D5) ; **pas** sous `api.` (dont la
doc dit « la table des routes EST le registre des outils »). **Caddy (C-1, vérifié : deux blocs sur la même adresse ⇒
« ambiguous site definition »)** : pas de bloc séparé — un `handle_path /narabi/*` (`root /var/lib/monark-sentinel/public`,
`file_server`, lecture seule, droits 0755/0644 lisibles par `caddy`) **inséré dans le bloc vitrine existant**, avant le
`reverse_proxy localhost:3000` ; première édition du bloc vitrine depuis le go-live ⇒ étape runbook nommée, `caddy validate`,
`curl` de la vitrine après `reload`, rollback = retrait du `handle_path`. La **page site** `monarkgate.tech/narabi/live` (lot refonte,
designer) lit ces fichiers. Option B (dépôt de données public `narabi-data`, historique git tamper-evident) = **ancrage
hebdomadaire** ultérieur, décision investisseur (nouveau dépôt = action sortante).

**D5 — Déploiement (addendum ADR-M005 D12).** Seconde unité systemd `monark-sentinel.service` + `monark-sentinel.timer`
(quotidien, après minuit UTC + marge de finalité), **utilisateur dédié `sentinel`**, répertoire d'état propre
(`/var/lib/monark-sentinel`, seul chemin en écriture : `ReadWritePaths=` avec `ProtectSystem=strict`), **aucun accès en
écriture au harnais** ; **0 dépendance nouvelle** (built-ins Node seulement, R-8) — `apps/sentinel` entre dans le `npm ci` de
`/opt/monark-harness` via `git archive apps`, `WorkingDirectory=/opt/monark-harness` en lecture seule (C-2) ; le
VPS gagne pour la première fois un processus à réseau sortant (pool RPC public, sans clé). Même canal SSH, même
discipline (append Caddy, `caddy validate`, `no_secret_in_repo`). **Ordre obligatoire** : (a) redéploiement du harnais
depuis HEAD (l'endpoint public ne sert pas encore la classe Narabi — deuxième écart d'honnêteté si on annonçait avant) ;
(b) sentinelle ; (c) **J0 = première fenêtre publiée** (sans prédécesseur ⇒ `non_evaluable`) ; **le premier pas du
tracker est la fenêtre J0+1** ; **T compte les pas live, jamais la calibration** (`t₀ = 0`) — ruling orchestrateur M012-b (Q1).
`--day` non-dry = le jour suivant naturel seulement (garde CLI), sinon `throw` ; sur état non vide il **plafonne** le rattrapage
(Q2). Aucune étiquette `run_label` : le régime est mécanique, l'étiquette `run` du pull n'existe pas en direct (Q3 ; les 3 paires
de clôture 10-13/14/15 comptent calmes ⇒ 616 paires mécaniques vs 613 du recorder, max glissant inchangé 27/90).

**D6 — Paramètres et critère (iii), pré-enregistrés.** Officiel : `c = B = 1/24`, **`ε = 0,1`** (ABB, valeur expérimentale
des auteurs, l.432), `t₀ = 0`, `q₁ = q̂ committé = 1,3119e-4`, `α = 0,10`. **Tolérance nommée `δ_target = α = 0,10`** (D8 M008
écrivait « ε » pour la tolérance : collision de nom levée). T(borne ≤ 0,10) mesuré : **1789 j** (ε = 0,1) / 779 j (0,05) /
453 j (0,01) — l'investisseur peut choisir ε = 0,01 (4× plus tôt, bang-bang plus ample, aucun consommateur) **avant J0** ;
après J0, tout changement de `c`/`ε` = **nouveau segment** de digest chaîné et borne publiée basculant de Thm 1 à Thm 2 (ABB
l.221-253, pas arbitraires). Pas de second tracker officiel ; une section `instrument` (rejeux `c = q̂`, `ε = 0,01`, CUSUM avec
contrôle par permutation) est publiée étiquetée, jamais portée. **Critère (iii)** : `r_t` = taux de raté **statique** sur les
**90 dernières paires calmes** ; référence in-sample max = **0,30** (27/90, fenêtre finissant 2025-04-30) ; **drift déclaré
ssi `r_t ≥ 0,40`** (= 0,30 + 2·sd(0,30 ; 90) ≈ 0,30 + α ; 0 déclenchement in-sample par construction ; ≈ 2,5 % par fenêtre
sous une phase persistante au record ; délai ≈ 70 j sur un saut à 0,5 ; évaluable après 90 paires calmes ≈ 100 j). Ce que
ça déclenche : **l'ouverture d'un ADR** (branche (a) ou recalibration sur régime récent), **jamais une bascule
automatique**. Rejetés : `B_t < bFloor` (P(B_t < 0 | p = 0,1) = 0,35 → 0,49, item (a) M009) ; CUSUM comme déclencheur (tire
in-sample). **Ordre (C-14)** : aucun pull d'une fenêtre postérieure à 2025-10-15 avant que ε soit **committé** (M012-a) ; le dry-run
`--day J0−1` n'écrit rien (état jeté) ; le replay `instrument` des 11 mois 2025-10-16 → J0 tourne **après J0**, digest
séparé, jamais l'état live.

**D7 — Phrase d'échangeabilité corrigée (M008 D7 amendé).** `STABLE_RUN_COMMITTED_SENTENCE` (`gate.ts:76-79`) remplace
« exchangeability is declared within that population » par : « coverage is stated under the split-conformal bound of
Barber, Candès, Ramdas and Tibshirani 2023 (Thm 2, unit weights): at least 1 − α minus the average total-variation gap
between calibration windows and the next one; that gap is not estimated here and the calibration is measured
non-stationary across half-years, so 1 − α is the coverage only if that gap is zero (exchangeability), which is not
assumed here; no coverage is measured » (C-10). **Précision M012-a (worker, mesuré)** : la constante n'est consommée que
par `honestyText` (tools/call) ; pour que `tools/list` dérive réellement, `GATE_TOOL_DESCRIPTION` **interpole**
`${STABLE_RUN_COMMITTED_SENTENCE}` (motif B-2, une constante) et la trace h5 est re-pinnée sur cette base. `Candes` en ASCII
dans le code (lang:gate/export:check ; précédent `l1-split.ts:6`), diacritique conservé dans les ADR.

**D8 — Nommage, phrase K-1, vocabulaire.** Phrase publique unique (anglais) :
> « Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the attested daily USDe
> redemption flow: its state moves each 24h window from the realized outcome, and the full timeline is published so
> anyone can replay it. What it carries is a deterministic long-run bound that tightens as windows accumulate, printed
> daily with T, not a per-window coverage, not a probability; the gate's committed calibration does not depend on the
> tracker state. Until the pre-registered
> drift criterion fires and an ADR says otherwise, the gate's region is still the committed static calibration: the
> tracker adapts, the gate does not yet. »
`vocab-banned.json` : ajouter `adaptive(ly)?\s+(cover|guarantee|region|gate)` et `(coverage|region|gate)\s+adapt` (site,
harness, skills — C-3 : attrape « the gate adapts », « adaptively covers ») ; **pas d'`exemptPhrases`** (déviation mesurée
M012-a, G2 F2 : la phrase D8 ne matche aucun motif, une entrée inerte casserait le garde `vocab_site_confidence_exemption`,
et les scopes harness/narabi_docs ne consomment pas `exemptPhrases` — le test asserte D8 verte SANS exemption) ; mutant surclaim ; **`README.md` ajouté à `scan.narabi_docs.files`** (C-4 : sinon AC-5 n'est pas imposé). « live » est **banni dans le scope `skills`** (M006 M-9)
⇒ « daily » / « attested 24h flow » dans SKILL/INTEGRATION ; « guarantee » nu banni ⇒ « bound ».

**D9 — Amendements dans le même commit.** ADR-M008 D8 : décision investisseur verbatim, `error_origin = n/a`, supersède
« ne pas marketer adaptatif avant ACI » ; reste vrai : aucune couverture par fenêtre, aucun pourcentage, région du gate
inchangée avant (iii). ADR-M009 §10 (« jamais adaptive » → phrase D8, amendement daté) — **en M012-a** ; `tracker.ts:4-8` (en-tête
« D8 (i)-(iii) unmet » → « (i)-(ii) delivered by the sentinel (ADR-M012), T counted from its first step; (iii)
pre-registered, unmet », lignes 5-8 alignées) — **en M012-b seulement**, quand `apps/sentinel/` existe (C-8 : vrai à la
date du commit ; le découpage §5 du PLAN rendait la version M012-a fausse — finding worker). Item (e) M009 (« Hikae Adaptive Conformal Control », `index.ts:2`) : la décision verbatim porte sur « narabi
adaptatif », pas sur ce titre ⇒ **reste formé** (déclencheur/action inchangés), porté à l'escalade en une ligne (C-13). `produced_at` de la prévision live = **clôture** de la fenêtre (le recorder posait l'ouverture ;
déclaré, hors score).

## Sources
- **[lu]** ABB 2024 arXiv:2402.01139v2 : Thm 1 l.196-205 ; Thm 2 (pas arbitraires) l.221-253 ; ε = 0,1 l.432 ; Lemme 1 l.556-561.
- **[lu]** Barber, Candès, Ramdas, Tibshirani 2023 arXiv:2202.13415v5, Thm 2 (poids unitaires), §4.4.
- **[lu] données** : `fixtures/usde-calib-series.json` (sha `7c33027a…`, 701 fenêtres, 613 paires calmes) — mesures advisor-defi
  §0/§1/§5 recomputées en session (`Bash` lecture seule) ; à **rejouer** au checkpoint-1 (test de permutation, max glissant 90).
- Code : `usde-full-pull.mjs:101-116, 186`, `record-usde-calib.mjs:45-60, 88-93`, `adapter-narabi.ts:197-198`, `l2-monitor.ts:41-56`,
  `tracker.ts`, `gate.ts:70-79`, `vocab-banned.json:60,74,83`, `deploy/*`, `RUNBOOK-harness.md`.
- **Références retirées (C-12)** : aucune théorie d'ARL n'est portée par ce lot (l'instrument CUSUM est contrôlé par
  permutation, D6) ; Lorden 1971 / Shin–Ramdas–Rinaldo / Vovk 2012 ne sont **pas cités** — un futur usage = procurement formé
  (identité complète, DOI/arXiv résolus) avant citation.

## Alternatives rejetées
- **Tracker dans le harnais** : casse K-8/D0/D6 (réseau + persistance dans un serveur pur) — rejeté sans réserve.
- **Bascule automatique de la région sur (iii)** : la garantie L1 disparaîtrait sans ADR ; `B_t → 0` par construction (M009 §7).
- **Publier sous `api.`** : contredit « route set IS the registry ». **Nouveau sous-domaine** : action DNS sortante inutile.
- **Dépôt de données comme canal primaire** : chaque sync du miroir est une action sortante (M010 §2.5) ; gardé en ancrage.
- **Deux trackers officiels** : la timeline publiée rend toute paramétrisation dérivable ; un seul état porté.
- **Ancrage onchain** : clé chaude + gaz pour un gain marginal ; OpenTimestamps [2nd] sous R-8 si un jour.
- **CUSUM / `B_t < bFloor` comme critère (iii)** : tirent sur du bruit ou in-sample (mesuré).

## Conséquences
- **Positives** : (i) et (ii) réellement remplies dès J0 ; « adaptatif » vrai comme mécanisme ; rejouabilité tierce ; phrase
  d'échangeabilité enfin honnête ; le gate reste sous garantie L1 ; aucune clé, aucun contrat gelé.
- **Négatives (assumées)** : la borne publiée est vide pendant ~5 ans à ε = 0,1 (ou ~15 mois à ε = 0,01) ; en calme le tracker
  cycle autour de 0 (33 % de fenêtres à burns = 0) — publié tel quel ; un processus réseau sortant sur le VPS ; la page site
  et l'annonce dépendent de trois actions sortantes (redéploiement, sentinelle, textes publics).
- **Items formés** : (a) M009 cité (B_t à bFloor = 0) — inchangé ; (g) ancrage hebdo option B — déclencheur : premier mois
  live ; action : décision investisseur nouveau dépôt ; (h) instrument CUSUM : théorie ARL — déclencheur : toute citation publique de l'instrument ; action : procurement formé
  Lorden 1971 (Ann. Math. Statist. 42(6)) + Shin–Ramdas–Rinaldo (arXiv:2203.03532) + Vovk 2012 (PMLR 25) AVANT citation.
  (j) **M012-c** (scission R-25 formée, worker M012-b à 1197/1205) : `apps/sentinel/src/instrument.ts` (rejeux `c = q̂`,
  `ε = 0,01`, CUSUM Page p₀ = 0,125 / p₁ = 0,25 graine 20260917 + contrôle par permutation ; **digest séparé, jamais dans
  `state.json`**) + test `sentinel_instrument_separate_digest` + **`docs/RUNBOOK-sentinel.md`** (rédigé en M012-b, sorti du lot
  au G7 : R-25 mesuré 1207 > 1205 après les ajouts ADR ; conservé hors arbre, réintégré tel quel en M012-c — le déploiement
  (go 3) n'intervient qu'après M012-c) **+ (checkpoint-2 C-d)** : RUNBOOK en-tête RC1 (J0 = première fenêtre publiée, premier pas
  J0+1 ; premier run de production = drop-in `MONARK_SENTINEL_J0`, **jamais `--day`**) ; `gate:vocab` étendu à `apps/sentinel` +
  `deploy/` (G2 C2 — décision : **oui**, la sentinelle implémente le tracker « adaptatif », le ratchet doit la couvrir) ; `USDE_STABLE_RUN_CALIB`
  exposé par export de paquet au lieu de l'import profond `../../harness/src/calibration.ts` (G2 C3 — décision : **oui**, R-3) ; résumé JSON
  de `run.ts` imprime `startDay` (O-a) ; création de `/var/lib/monark-sentinel/public` 0755 propriétaire `sentinel` = étape runbook (O-d) ;
  déclencheur : commit M012-b ; action : lot M012-c.
  (k) `observed_at.instant` = clôture (D9) ⇒ `attested_flow_sha256` de la sentinelle ≠ celui du recorder (ouverture) pour la même
  fenêtre (mesuré 2025-03-01 : `c9893475…` vs `128b1084…`) ; hash A3 et vélocité identiques, scores committés intacts — déclaré.
  (l) **publication de `instrument.json` sous `/narabi/`** (G2 M012-c O-3 ; D6 « section instrument publiée étiquetée ») et **rejeu
  post-J0 des 11 mois** sur la timeline live (`--timeline <jsonl>`) — déclencheur : J0 passé + go 3 ; action : étape runbook + entrée CLI, digest
  séparé, jamais dans `state.json`. **Rapport à (h) (checkpoint-2 M012-c C-3)** : publier `instrument.json` sous `/narabi/` **est** une
  citation publique de l'instrument ⇒ le procurement (h) (Lorden 1971, Shin–Ramdas–Rinaldo, Vovk 2012) devient **précondition de (l)** ;
  et l'entrée CLI de publication portera une garde `--out` hors de `public/` tant que (h) n'est pas clos.
  (i) redondance de `GATE_TOOL_DESCRIPTION` (G2 F3 : « every other population abstains (under_calib) » rendu deux fois, queue
  de la phrase committée + clause `${STABLE_RUN_UNCALIBRATED_SENTENCE}` exigée par `gate.test.ts:468`) — honnête, assumée ;
  déclencheur : prochain lot touchant `GATE_TOOL_DESCRIPTION` ; action : dédoublonner sous contrainte du test + re-pin h5 (C-17).
- **Actions SORTANTES (go per-action, jamais inférées de « on finalise tout »)** : 1. push `b8937b1` + lot M012 (PR → checks
  → FF) ; 2. redéploiement harnais VPS ; 3. déploiement sentinelle + **édition du bloc vitrine Caddy** (`handle_path /narabi/*`, C-1) ; 4. textes publics « adaptive »
  (README, site, skill ClawHub, description registre) ; 5. annonce (avec T et la date J0).
