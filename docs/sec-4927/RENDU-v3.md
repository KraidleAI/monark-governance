Modèle résolu : claude-opus-5-5[1m]

# RENDU-v3 — lettre de commentaire SEC File No. 4-927 (MONARK Bell), version 3 (décision investisseur 141)

(R-1 : préfixe attendu `claude-opus-5-5` — à vérifier par l'orchestrateur avant consommation.)

**Provenance** : worker `claude-opus-5-5[1m]`, effort max, 2026-09-23 (horloge `date -u` : premier relevé 05:56:23Z ; relevé avant la
revue finale 06:29:29Z ; dernier relevé avant clôture 06:35:23Z) ; contexte : mission orchestrateur « DOCS — lettre SEC 4-927, version v3 », décision investisseur 141
(`docs/CHANTIERS.md:992`), avis gouvernant `docs/sec-4927/AVIS-advisor-marche-v2.md` (sha `e2806cdf…ae00`) ; réviseur : orchestrateur
(R-21). **Mode** : docs-only ; écritures limitées à `F:\Monark\docs\sec-4927\LETTRE-4-927-v3.md` et à ce fichier, plus le scratchpad de
session (harnais `scratchpad/v3/`) ; v2 (`01de804a…be6d`) et squelette (`3f27e46b…c239c`) NON modifiés (sha identiques avant/après) ;
aucun commit, aucun workflow (R-20) ; aucun appel réseau. Dépôt lu : `F:\Monark` (`lot/etude-suite`) — HEAD `04bea28` au départ, avancé
pendant la mission par des commits orchestrateur à `0ee3df8` (décision 142, +1 ligne après la l.992 de CHANTIERS) puis `b89ad29`
(`bd264f4` G7 STATS-1 : +12 lignes après la l.993 ; ADR-U4b, RUNBOOK Ukemi, ETAT-REPRISE, CHECKPOINT2 GARDE-FSYNC-1), puis `12b6dcd`
et `db86efc` (G7 UKEMI-RETRY-2/3 : `apps/sentinel`, ADR-U4b, ADR-GARDE-HELIUS, G1/G2/CHECKPOINT2 Ukemi, CHANTIERS +9 lignes après la
l.1005) ⇒ aucun fichier cité ici n'est touché hors de ces ajouts ; les lignes de CHANTIERS citées (≤ l.992) sont re-lues identiques à
`db86efc` ; les fichiers modifiés/non suivis vus par `git status` pendant la mission hors `docs/sec-4927/*-v3.md` sont ceux de ces commits
orchestrateur, pas des écritures du worker. Arbre
d'exécution épinglé `F:\Monark-wt-bellexec` HEAD `a703e244…` (lecture seule) ; répertoires de course TERMINÉS
`F:\course-bell\bell-b3d-run-{tslax,aaplx,nvdax}-completion` (lecture seule ; le `--out` vivant de SPYx n'a PAS été ouvert).

## 0. Livrables et état en une ligne
- `F:\Monark\docs\sec-4927\LETTRE-4-927-v3.md` — sha256 : voir le message de rendu (valeur finale recalculée après la revue finale ;
  états intermédiaires : `c1a4bce4…29eb` à 06:22Z, `3594d393…381d` à 06:29Z avant la revue finale) ; 85 lignes ; anglais ; **1 318 mots de
  corps** (même méthode que v2 : v2 = 1 661, delta −343) ;
  **14 placeholders** `<<…>>` (un par ligne : 14 lignes = 14 occurrences) ; 0 octet CR ; **13 citations de l'ordre** localisées mot pour mot,
  page concordante, ≤ 25 mots (max 15) + le titre du papier de Cong ; **3 pages en Times 12 pt** (interligne 1,15, marges 1 pouce,
  Letter ; ≈ 3 lignes libres en bas de page 3) et 3 pages en 11 pt ; gate vocabulaire du dépôt **0 hit (exit 0)**.
- Ce fichier (auto-référence : sha256 donné dans le message de rendu).

## 1. Journal (au fil de l'eau)
- [05:56Z] Lectures d'entrée intégrales : LETTRE-v2, RENDU-v2, AVIS-advisor-marche-v2, SOURCES, NOTE-DEPOT, FAITS-lettre-ross,
  CHANTIERS (141 l.992, 138 l.915, 139 l.921 ; l.59, l.119-123, l.215, l.838, l.898, l.964), ADR-T1aii D1-nonies (l.397-606) + l.8/l.16/l.236,
  ANCHORS, `git show 766402e --stat`.
- [05:56Z-06:01Z] Vérifications de première main AVANT rédaction (§3 : V3-1..V3-9). Deux constats hors mission : (i) le ratio Q6 du
  code n'est ni « par session » ni « du mois précédent » (V3-5) ; (ii) le dépôt est PRIVÉ (V3-6) ⇒ « published » des ancres dépend de
  `url_method`. RENDU initial écrit (durable).
- [06:0xZ] **Advisor intégré** consulté avant rédaction (conseil, pas verdict) : 7 pièges (« émetteur » ≠ TSV ; dénominateur non daté
  par Bell ; ancres OTS ≠ timeline ; phrase OTS conditionnée ; restriction aux 3 mints ; 135(a) rendu sans objet ; 14 placeholders) +
  consignes de rédaction (4 propriétés quotables au conditionnel, aucune affirmation d'absence, « recomputable » plutôt que « verifiable »,
  outil Write, harnais v2 rejoués). Tous suivis (§4).
- [06:0xZ-06:27Z] Lettre écrite (outil Write), harnais rejoués ; longueur mesurée 1 631 → 1 481 → 1 370 → 1 330 → 1 331 → 1 334 → 1 315
  mots ; 12 pt : 4 pages (130 mots en p.4) → 4 (43) → 4 (4 : la seule ligne de signature) → 3 → 4 (ajout « and invites modifications »
  pour Q6) → **3** après suppression de lignes veuves ; coupes supplémentaires déclarées (§2, D-v3-5).
  Incident d'outillage : `section-words.mjs` écrit d'abord par heredoc Bash a compté des caractères (la barre oblique inverse doublée
  réduite, A-13 connu) ⇒ réécrit par l'outil Write (D-v3-13).
- [06:22Z-06:29Z] Contrôles rejoués (§7) ; ce fichier complété ; livrables durables AVANT la revue finale.
- [06:29Z-06:33Z] **Advisor intégré, revue finale** (conseil, pas verdict) : 3 défauts de provenance du RENDU (heure future dans le
  journal ; renvoi « voir §7 » pendant ; D-v3-2 disait à tort que SOURCES Q6-1 ne porte pas « par session ») + 3 points non bloquants
  (« stops the run unrecorded » lisible à l'envers ; « (Helius) » inséré dans la formule dictée non déclaré ; mesure 11 pt de D-v3-5) —
  tous traités : lettre « is not recorded and stops the run » (1 318 mots, re-mesurée 3 pages à 12 pt, ≈ 3 lignes libres), D-v3-2,
  D-v3-5 et D-v3-11 corrigés, heures réelles écrites.
- [06:33Z-06:35Z] Contrôles finaux rejoués sur la lettre finale (§7) ; sha finaux dans le message de rendu.

## 2. Tableau v2 → v3, section par section (coupé / réécrit / pourquoi / source)

| Section | v2 | v3 | Pourquoi | Source |
|---|---|---|---|---|
| Bandeau | « DRAFT v2 », renvoi RENDU-v2 | « DRAFT v3 », renvoi RENDU-v3 | version | mission |
| Objet | « …: comments on Questions 3 and 6 » | « …: Questions 3 and 6 » | ligne unique à 12 pt | mission item 7 (D-v3-5) |
| Résumé | 3ᵉ phrase « Under the Order, each venue… » ; 4ᵉ « Bell answers with a method: first-hand ledger data, two data operators, anchored collection logs, replayable computations, fail-closed refusals and a declared budget. » | 3ᵉ phrase retirée (portée par §1) ; 4ᵉ remplacée : « we report what Bell measures and suggest four properties that the Commission could expect from a TSV's publication under Section II.G, so that a third party could recompute what a venue reports; Bell applies them to its own records » | option B ; « first-hand », « two data operators », « fail-closed », « budget » supprimés | AVIS §4 B (l.72, l.75) ; Q3 (l.41, l.45) ; décision 141 |
| §1 al.1 | 3 citations (p.14 « will help… evaluate », p.57 « monitor closely », p.57 « solicits public comment ») | 1 citation : « intends to monitor closely the use of the exemptions » (p.57) | longueur ; « monitor closely » = élément du vide exprimé (décision 138) | mission item 7 (D-v3-5) ; CHANTIERS:915 |
| §1 al.2 | « computes and reports » ; « its own » ×2 ; « updated within ten minutes » ; phrase II.E « must verify » + item i « the steps (e.g., audits, certifications, attestations) » | « reports about itself » ; « its » ; citation ajoutée « in a machine-readable format » (II.G, p.28) ; « ten minutes » porté par la description de Q3 ; phrase II.E + item i RETIRÉE ; p.17 + II.L conservés | crochet de l'option B (publication lisible par machine) ; II.E/item i hors Q3/Q6 (et retire « certifications/attestations » de la bouche de la Commission) ; II.L gardé | AVIS Q2 « Ne pas couper : II.L » (l.36) ; D-v3-5 |
| §1 al.3 | « notes the risk that TSV prices "could dislocate…" and designs… » ; « transparency provided by AMMs » ; II.A ; « third-party audits and » | citation « could dislocate… » retirée, « designs the volume limits "to help limit…" » gardée ; « AMM transparency » (paraphrase) ; II.A DÉPLACÉ en §3 propriété (a) ; « third-party audits and » retiré | longueur ; II.A sert désormais la propriété « recalculable depuis le registre public » | D-v3-5 ; mission item 1 |
| §1 al.4 | Q3 sans sa sous-question « modifications » ; « what effects … could have on market quality » ; « Tier 1 and Tier 2 limits » | « and what modifications "should be made to the TSV Exemption" » (p.58) ajouté ; « the effects of … on market quality » ; Q6 : « the Tier limits are appropriate and invites modifications » (p.58 l.2062-2064) ; formule O-22 gardée | l'avis relève que zéro phrase ne répondait aux « modifications » de Q3 | AVIS Q1 (l.23) ; ordre p.58 l.2047-2048 |
| §2 Population | « today » ; « automated market maker pools » ; « The method transfers to TSV pools; the population does not. » | « AMM pools » ; « The method, not this population, is designed to apply to TSV pools. » | surclaim : présent assertif sur une population inexistante | AVIS Q3 (l.43) ; mission item 3 |
| §2 Q3 | « For each declared session » ; « P_session … fills in the session, and P_close is » ; auteurs en prénoms + noms ; « by more than 1, 2 and 5 percent » ; tableau 6 lignes ; légende avec définitions de Cong ; « Other symbols and the holiday regime: `url_report` » | « For each session » ; « fills, and P_close the last … » (longueur) ; noms seuls ; « beyond a threshold » ; **tableau 4 lignes** (lignes 2 % coupées) ; légende : « they also report a 2 percent threshold » (définitions de Cong retirées, « session definitions differ » gardé) ; `url_report` fondu dans `url_state` (§5) ; **bouclier causal inchangé** | supprime 2 placeholders et la dépendance I-v2-3 (code non écrit) ; `url_report` redondant | AVIS Q2 (g) (l.34), (h) (l.35), « Ne pas couper l.48 » (l.36) |
| §2 Q6 | « For each session, Bell publishes the ratio … to the prior month's consolidated average daily share volume » ; phrase « Aggregated to the monthly arithmetic … (SPYx), to be read against the 0.25 percent (Tier 1) and 2.5 percent (Tier 2) limits » + 5 placeholders ; « only the ratio is published » | « For each observation window, Bell publishes the ratio of the volume in its observed pools, recomputed from on-chain swaps counted once per signature and converted to shares with the on-chain multiplier, to the underlying stock's consolidated average daily share volume over a period stated in its method » ; phrase « Aggregated… » RETIRÉE avec `window_q6`, `volm_*` ×4 ; phrase l.60 « These pools are not TSVs… » **inchangée** | (i) comparaison de pools non-TSV aux limites d'un régime dont ils sont exclus = passage le plus fragile ; I-5 inexistant ; (ii) correction factuelle hors liste fermée : le code ne calcule ni par session ni sur le mois précédent (V3-5) | AVIS Q4 conditionnels (l.54) ; décision 141 ; D-v3-2 |
| §3 titre | « Our method: a record anyone can recompute » | « What the Commission could expect from a TSV's publication » | option B | décision 141 ; mission item 1 |
| §3 corps | 9 puces descriptives (First-hand data ; Two data operators ; Complete pages, fail-closed ; Declared budget ; Anchored ; Recomputable ; Signed ; Independent of the venues ; Declared abstention) | (a) chapeau de PROPOSITION (« In answer to the requests for modifications in Questions 3 and 6, we suggest four properties that the Commission could expect… None changes a limit; each lets a third party recompute what a venue reports. ») ; (b) **4 propriétés** au conditionnel : *Recomputable from the ledger* (II.A cité), *Named abstention*, *Published and anchored digest*, *Dated periods* (note 81, p.29 ; renvoi à la « miscalculation » p.26) ; (c) « Bell applies these properties to its own records, outside the TSV framework » + 4 puces de démonstration (voir lignes suivantes) ; (d) paragraphe hôte + indépendance | option B, Bell = démonstration existante hors TSV ; aucun « Bell will… » (AI-6 maintenu) | décision 141 ; AVIS §4 B ; mission items 1, 3 |
| §3 démo *Recomputable* | « First-hand data » + N_exact/pages (8,783,173 …) + `nexact_SPYx` ; puce « Two data operators » + `verdict_SPYx` ; règle « Every page but the last must be full » + phrase 135(a) | « transaction-level ledger data, obtained through one operator's enumeration (Helius) and cross-read on a second endpoint for the multiplier events » (formule de la mission) ; **TSLAx, AAPLx, NVDAx seulement**, sans nombres ; une phrase : page défectueuse (dont écart d'événement) non enregistrée et arrêt du tirage (« is not recorded and stops the run ») ; complétude = requête séparée rend la dernière transaction enregistrée ; seconde méthode : même historique ; « bit for bit » gardé, conditionné à `url_method` | surclaim « first-hand » ; titre trompeur ; chiffres de diligence interne illisibles ; SPYx non terminé ; 135(a) sans objet sans la règle (D-v3-6) | AVIS Q2 (a), (c) ; Q3 (l.41-42, l.44) ; Q4 retirables (l.53) ; mission items 3, 4 |
| §3 démo *Named abstention* | 3 codes (`no_close_ref`, `rebase_unverified`, `no_quorum`) + `residual_counts` ; « no rating and no probability » | 1 exemple (`no_close_ref`) ; « counts abstentions in its published state file » ; « no rating… » RETIRÉ (longueur) | jargon réduit à un exemple ; placeholder retirable | AVIS Q3 (l.45) ; Q4 (l.53) ; D-v3-5 |
| §3 démo *Anchored digests* | puce « Anchored » + `ots_upgraded` (état « 0 of 15 ») ; puce « Signed » séparée | log chaîné SHA-256 ; manifestes soumis à OpenTimestamps ; **phrase dictée** « 12 of 15 anchor proofs upgraded to Bitcoin attestations on 2026-09-23; the remaining 3 are published as they upgrade » ; limite de l'ancre ; timeline chaînée + signée Ed25519 (fusion de « Signed ») ; limite « a signature shows origin, not truth » | fait nouveau (commit `766402e`) ; ancres (manifestes des tirages) et timeline (chaînée, signée, NON ancrée) gardées en deux phrases distinctes | mission item 4 ; AVIS Q2 (f) ; D-v3-4, D-v3-9 |
| §3 démo *Dated periods* | — | « Each gap is keyed to the trading day of its closing price by a published rule, and each ratio is published with its observation window. » | seule démonstration vraie aujourd'hui (le dénominateur ADV n'est PAS daté par Bell) | V3-5, V3-7 ; D-v3-3 |
| §3 hôte | « runs only Bell and an external monitoring probe; it is operated and deployed by the MONARK orchestrator » | « published from a dedicated host operated by MONARK; the signing key never leaves it » ; `relation_commerciale` + « not from MONARK » gardés | un lecteur SEC ne sait pas ce qu'est un orchestrateur (AI-7 tranché) | AVIS Q2 (d), Q3 (l.46) ; CHANTIERS:120 |
| §4 | puce 1 avec « The rules above protect only the ends of an enumeration » ; puce 2 avec phrase NEAR × Ondo ; puce 3 | puce 1 sans la phrase « rules above » ; puce 2 : **NEAR × Ondo RETIRÉ**, compressée ; puce 3 inchangée | décision 141 (139 conservée pour le produit) ; longueur | AVIS Q5 (l.59) ; mission item 5 |
| §5 | `url_state`, `url_timeline`, `url_method`, `contact` | « State and timeline, including other symbols and the holiday regime » ; conditions de `url_method` étendues (« bit for bit », « published as they upgrade », périodes, règle du jour du close) | `url_report` fondu ; conditions des phrases au présent | AVIS Q2 (h), Q3 (l.44) |

**Coupes (a)-(h) de l'avis — état** : (a) FAIT ; (b) FAIT ; (c) FAIT ; (d) FAIT ; (e) FAIT ; (f) FAIT, fusion dans « Anchored digests »
plutôt que dans « Recomputable » (D-v3-4) ; (g) FAIT ; (h) FAIT. **Gardés** : bouclier causal (v2 l.48), II.L, phrase v2 l.60.

## 3. Constats vérifiés de première main (rejouables, §11)
- **V3-1 — OTS, commit `766402e`** (`git show 766402e --stat`) : 12 fichiers `.ots` mis à jour (tailles 689-980 → 1 656-5 302 octets),
  message « 12 Bell anchor proofs upgraded to Bitcoin attestations (ots upgrade 05:38Z); 3 newest (mint_end-NVDAx, mint_start-SPYx,
  mint_resume-SPYx-1) still pending » ; date du commit 2026-09-23T05:39:18Z. **Corroboration octet** (`scratchpad/v3/ots-heights.mjs`,
  sha `f91027…c7aa`) sur les 15 `docs/course-bell/*.ots` à HEAD : tag d'attestation de bloc Bitcoin `0588960d73d71901` présent dans 12,
  absent des 3 cités ; hauteurs lues dans la charge utile varuint : 968149-968205 ; `mint_end-AAPLx` porte **968199** et 968205
  (968199 = mesure de l'orchestrateur, concordant). **Ce n'est PAS un `ots verify`** (aucun client `ots` ni nœud Bitcoin exécuté par le
  worker) : présence d'octets, pas validité cryptographique.
- **V3-2 — trois mints terminés** (re-lus ce tour) : `crosscheck-{TSLAx,AAPLx,NVDAx}.json` sha `c4bccfd8…58a7` / `152de642…c02d` /
  `45ca7fe5…1a57` = lignes des manifestes `mint_end-*` (manifestes sha `a682b3b7…7171` / `8ba5f9c1…67d2` / `e2b8464b…5500` = colonne
  `manifest_sha256` d'ANCHORS) ; `scan_complete true`, `comparator_verdict.verdict "equal"` ×3.
- **V3-3 — règles de refus et de complétude** (`F:\Monark-wt-bellexec\apps\bell\src\rebase-crosscheck.ts`, `a703e24`, sha
  `6a2b96ef…a98c`) : deux opérateurs distincts exigés (l.250-251, `no_quorum`) ; pages via Helius seul (l.252, l.275) ; chaque événement
  43/x trouvé relu sur l'autre opérateur, écart ⇒ `body_quorum` (l.301-305) ; `block_time_null` / `non_monotonic` / `body_quorum` ⇒ page non
  committée, retour immédiat (l.306) — **indépendant de `require_full_pages`** (vrai aussi sous `--allow-short-pages`) ; `complete =
  exhausted ∧ initialize ∧ endAnchorOk ∧ ¬sameSlotAmbiguous` (l.330-345), l'ancre de fin étant une requête desc `limit 1` bornée au slot
  épinglé dont la signature doit égaler la dernière signature asc (l.331-335). Helius-exclusif : ADR-T1aii l.8, l.236.
- **V3-4 — ordre 34-106402, II.G et II.F relus** (texte pré-extrait sha `adee69f6…4d08d`) : II.G p.28 l.1085-1088 (données en dollars,
  « freely and publicly available in a machine-readable format », mises à jour sous dix minutes, (i)-(v) symboles/prix/taille/heure/sens) ;
  note 78 (méthodes de conversion en dollars), note 81 p.29 l.1129-1131 (volume journalier « between the time of data publication as
  determined by the TSV and the previous 24 hours ») ; II.F p.24 l.898-906 (limites, arithmétique ; dénominateur « during the prior month
  … as reported by an effective transaction reporting plan ») ; p.26 l.1011-1013 (miscalculation) ; p.28 l.1076-1077 ; **aucune obligation
  de PUBLIER le ratio** dans II.F (le TSV calcule, s'arrête, notifie, amende sa Notice, p.26-27) — d'où la propriété (d) formulée comme
  proposition, jamais comme lecture de l'ordre ; Q3 entière p.57-58 l.2039-2048 ; Q6 p.58 l.2057-2064.
- **V3-5 — Q6 : ce que le code calcule** (`apps/bell/src/collect.ts` à HEAD, sha `67d7091f…9fb1`, inchangé depuis `46b6cef`) :
  numérateur = `poolVolumeBase(s.fills)` sur TOUS les fills de la fenêtre de collecte (l.190-197 ; fenêtre par défaut 3 jours,
  `--window-days`, l.431-433), pas par session ; dénominateur = moyenne des barres journalières de la fenêtre **glissante de 45 jours
  calendaires** se terminant à la fin de la fenêtre (`advVolumes`, l.383-392, `toUtcMs − 45 × 86 400 000`, ≤ 60 barres), **pas le mois
  civil précédent** ; objet publié `{symbol, vol_ratio, multiplier_unit}` dans le `digest` de `state.json`, avec `window
  {from_utc_ms, to_utc_ms}` (l.243-244, l.266-267) ; la période de l'ADV n'est PAS publiée. Or ADR-B0 D2 (iii) (l.30) et ADR-T1aii l.16
  écrivent « ADV consolidé mois précédent », et la v2 disait « For each session … prior month's » ⇒ écart code ≠ ADR ≠ lettre v2 (D-v3-2,
  item I-v3-1).
- **V3-6 — dépôt privé** : remote `KraidleAI/monark-governance` ; décision 76 (CHANTIERS:215) : pushes en dépôt PRIVÉ, visibilité
  ouverte seulement à la fenêtre publique du release ⇒ manifestes + `.ots` committés NE SONT PAS publics aujourd'hui ⇒ « the remaining 3
  are published as they upgrade » dépend de `url_method` (lien vers l'emplacement public des ancres).
- **V3-7 — jour du close de référence** : `refCloseDateOf` (`apps/bell/src/sessions.ts` l.145, sha `6aaec1e6…0ba3`) : off-hours et
  after ⇒ jour d'ancrage ; pre/regular ⇒ jour de bourse précédent ; clé de `closeRefBySession` (`collect.ts` l.138-140) ; publié
  indirectement (`session`, `earliest_publish_utc`, l.158-161) ⇒ « keyed … by a published rule » exige la règle sur la page de méthode.
- **V3-8 — signature de la timeline** : `collect.ts` l.81-82 « Tamper-evident; the Ed25519 signature is a T-1b fact (D8) » ⇒ chaînage
  codé, signature à T-1b (phrase au présent conditionnée, §6).
- **V3-9 — hôte** : CHANTIERS:120 (décision 57 : VPS Bell dédié, « n'accueille que Bell et la sonde externe ») ; CHANTIERS:119 (clé
  Ed25519 générée sur le VPS, jamais dans le dépôt) ; CHANTIERS:123 (clé non encore générée : au déploiement T-1b).

## 4. D-n — décisions et écarts du worker (motivés, vérifiables)
- **D-v3-1 (`error_origin` : orchestrateur — transcription de la décision)** : la mission et CHANTIERS:992 écrivent « toute publication d'un
  **émetteur** » ; II.G impose la publication au **TSV** (p.28 l.1085) et l'avis dit « publication II.G d'un TSV » (AVIS l.72). La lettre
  écrit « a TSV's publication under Section II.G ». Réversible si l'investisseur visait les émetteurs de jetons (hors II.G).
- **D-v3-2 (correction factuelle HORS liste fermée ; `error_origin` : worker squelette/v2 pour « For each session » — SOURCES Q6-1 (l.68)
  l'affirme, mais ses sources citées (`volume.ts` l.1-10, l.34-48 ; ADR-B0 D2 (iii) l.30 ; ADR-T1aii C-6 l.32) ne l'établissent pas : le
  ratio est calculé par symbole sur toute la fenêtre de collecte, hors de la boucle des sessions (`collect.ts` l.187-197) — ; et plan/ADR vs
  code pour « prior month », à adjuger)** : la phrase Q6 gardée par l'avis contenait deux affirmations
  contredites par le code (V3-5). Correction minimale : « For each observation window … over a period stated in its method ». Proposée à
  l'adjudication de l'orchestrateur (retour à la v2 possible seulement si le code est aligné AVANT dépôt, I-v3-1).
- **D-v3-3 (propriété « dated periods »)** : proposée pour les TSV (note 81 p.29 + « miscalculation » p.26) ; la démonstration Bell est
  bornée à ce que le code fait (V3-5, V3-7) ; aucune phrase ne dit que Bell date son dénominateur ADV.
- **D-v3-4 (fusion « Signed »)** : l'avis (Q2 (f)) proposait « Signed » → « Recomputable » ; en option B la signature relève de la
  propriété « digest publié » ⇒ fusion dans « Anchored digests », en DEUX phrases distinctes : ancres OTS = manifestes des tirages go-1 ;
  timeline = chaînée + signée, NON ancrée (aucune phrase ne dit « the published record is anchored »).
- **D-v3-5 (coupes au-delà de (a)-(h), autorisées par l'item 7 « viser 3 pages en 12 pt »)** : objet raccourci ; §1 : citations p.14
  (« will help … evaluate ») et p.57 (« solicits public comment ») ; phrase II.E « must verify » + item i ; « updated within ten minutes » ;
  « own » ×2 ; citation « could dislocate » (p.28 l.1074) ; « third-party audits and » ; « what effects … could have » → « the effects of » ;
  « Tier 1 and Tier 2 limits » → « Tier limits » ; §2 : « today », « declared » (session), « in the session », « is » (P_close), prénoms des
  auteurs, définitions de Cong, « by more than » → « beyond », « only the ratio is published », « swap records » → « swaps »,
  « transaction » (signature), « token's » (multiplicateur) ; §3 : « the only one we found offering it » (Helius), « no rating and no
  probability for any event », « own data », « separate » et « to Bell » (hôte : « a dedicated host », CHANTIERS:120) ; §4 : « The rules
  above protect only the ends of an enumeration ». Chacune réversible si le format retenu est 11 pt (3 pages mesurées à 11 pt / 1,15 : page 3 = 197 mots
  rendus, pour ≈ 614 mots en page 2 pleine). Ajout compensé : « and invites modifications » (Q6, p.58) pour que le chapeau du §3 (« requests for
  modifications in Questions 3 and 6 ») ait son appui en §1.
- **D-v3-6 (135(a) sans objet)** : la règle « Every page but the last must be full » n'est plus énoncée ; le critère énoncé (requête
  séparée ⇒ dernière transaction enregistrée) a tenu pour les trois mints (V3-2 `scan_complete true`), y compris ceux complétés sous
  `--allow-short-pages` ; la divulgation F-11/D-v2-11 n'a donc plus de contradiction à couvrir ; le fait reste en ADR-T1aii D1-nonies §3
  et CHANTIERS:838/898/964. Réinsertion obligatoire de la divulgation si la règle est réintroduite.
- **D-v3-7 (SPYx)** : démonstration du multiplicateur restreinte à TSLAx, AAPLx, NVDAx (pas de placeholder) ; la population garde les
  quatre jetons (registre de pools) ; extension = item I-v3-3.
- **D-v3-8 (compte des placeholders)** : la mission dit « 13 obligatoires » mais en énumère **14** (4 actes + 4 `t4_*` + 3 fenêtre/n +
  3 `url_*`) ; rapporté tel quel, conforme à « ~14 » de la décision 141.
- **D-v3-9 (phrase OTS dictée, gardée verbatim)** : deux conditions déclarées : « published » ⇔ ancres servies publiquement et liées par
  `url_method` (V3-6) ; « 12 of 15 … on 2026-09-23 » est un fait DATÉ, vrai tel quel, mais « the remaining 3 » vieillit ⇒ item I-v3-2.
- **D-v3-10 (« attestations »)** : la liste publique NOTE-DEPOT C-12 vise « attestation » pour une sortie Bell ; ici le mot nomme
  l'attestation de bloc Bitcoin d'une preuve OpenTimestamps (terme technique du format), dans la phrase dictée, bornée par la phrase
  suivante (« not where its pages came from or that the scan ran ») ; ruling orchestrateur demandé (I-v3-5), aucun contournement.
- **D-v3-11 (Helius nommé)** : la formule dictée par la mission (item 3) est reprise mot pour mot, **étendue** par « (Helius) » entre
  « enumeration » et « and cross-read » (ajout déclaré, retirable sans autre retouche) ; motif : comme D-v2-5 (opérateur réel, code l.252/l.275) ; décision 69 ne vise que le fournisseur de recoupement
  CASH ; aucun fournisseur de close ni d'ADV n'est nommé.
- **D-v3-12 (scope `harness`)** : 5 hits « pourcentage » (seuils 1/5 % du tableau, « 2 percent threshold ») ; ruling 141 : scope `harness`
  NON appliqué à la lettre ; aucun pourcentage n'est un taux de confiance ; les parts Bell portent n et fenêtre (placeholders
  `n_TSLAx_*`, `window_TSLAx`) ; les limites 0.25/2.5 percent ont disparu avec la phrase « Aggregated… ».
- **D-v3-13 (outillage)** : la réduction de `\\` par le transport heredoc (A-13) a faussé un compteur écrit en heredoc ; tout script à
  expression régulière réécrit par l'outil Write ; lettre écrite par Write.

## 5. Placeholders restants — 14 (`grep -c '<<'` = 14 lignes = `grep -o '<<' | wc -l` = 14)
| # | Placeholder (ligne) | Type | Format | Source attendue | Déclencheur |
|---|---|---|---|---|---|
| 1 | `<<DATE>>` (l.3) | acte | « Month D, YYYY » | acte investisseur AI-1/AI-4 | go de dépôt |
| 2-5 | `t4_TSLAx_{wkn,we}_{gt1,gt5}` (l.30-33) | MESURE | part des sessions avec g calculé dépassant le seuil ; entier + signe pour cent, arrondi déclaré depuis 2 décimales | `docs/MESURE-FONDATRICE-bell-2026-09.md` via `node apps/bell/scripts/bell-report.mjs --founding --d9 <D9 -b1-bis-ii>` (agrégats exceed1, exceed5 sur withGt — déjà agrégés par `bell-report.mjs`, pas d'extension requise) | course -b1-bis-ii terminée et ancrée ; item #11 livré |
| 6 | `window_TSLAx` (l.36) | MESURE | dates UTC ou bornes par pool | provenance -b1-bis-ii + MESURE-FONDATRICE | idem |
| 7-8 | `n_TSLAx_wkn`, `n_TSLAx_we` (l.38, l.40) | MESURE | entier (sessions avec g) | MESURE-FONDATRICE, colonne « n with g_t » | idem |
| 9 | `relation_commerciale` (l.64) | acte | phrase de l'investisseur | acte AI-5 | date du dépôt |
| 10 | `url_state` (l.76) | SERVI | `https://bell.monarkgate.tech/state.json` (sert aussi autres symboles, régime holiday, compteurs `residuals`) | `curl -sI` ⇒ 200 + test d'intégration non-LLM | T-1b backend servi (DNS compris) |
| 11 | `url_timeline` (l.77) | SERVI | `…/timeline.jsonl` | idem | T-1b backend servi |
| 12 | `url_method` (l.79) | SERVI | `/bell/method` liant clé publique, manifestes + preuves OTS, code de rejeu ; énonçant périodes du ratio et règle du jour du close | `curl -sI` + liens + validation visuelle investisseur (décision 73) | T-1b-site ; sinon retrait/réécriture des 6 segments listés dans le placeholder |
| 13 | `contact` (l.81) | acte | adresse publique (non expurgée, p.60) | acte AI-9 | dépôt |
| 14 | `<<SIGNATAIRE>>` (l.85) | acte | nom, titre, organisation (« Commenter Name ») | acte AI-3 | dépôt |

**Retirés (12)** : `url_report` (fondu), `window_q6`, `volm_{TSLAx,AAPLx,NVDAx,SPYx}` (phrase « Aggregated… » retirée), `nexact_SPYx`,
`verdict_SPYx` (restriction aux 3 mints), `ots_upgraded` (phrase factuelle dictée), `residual_counts` (« counts abstentions in its
published state file »), `t4_TSLAx_{wkn,we}_gt2` (lignes 2 % coupées). 26 − 12 = 14.

## 6. Phrases au présent qui exigent un chemin servi au jour du dépôt (règle Branchement, NOTE-DEPOT C-4)
| Phrase (v3) | Chemin servi requis | État 2026-09-23 |
|---|---|---|
| « keeps a public, signed record » (résumé) ; « Bell's public timeline is … signed with an Ed25519 key whose public half is published » ; « the signing key never leaves it » | timeline signée publiée + clé publique (T-1b) | non servi ; signature = fait T-1b (V3-8) ; clé non générée (V3-9) |
| « Bell publishes g = … » ; « Bell publishes the ratio … » ; « counts abstentions in its published state file » ; « each ratio is published with its observation window » | `state.json` publié | non servi (T-1b) ; champs présents dans le code (V3-5) |
| « designed so that anyone can recompute it » ; « bit for bit with the published replay code » | code de rejeu public lié depuis `url_method` | non exporté (CHANTIERS:59) |
| « the remaining 3 are published as they upgrade » | manifestes + `.ots` à un emplacement public lié depuis `url_method` | dépôt privé (V3-6) |
| « over a period stated in its method » ; « by a published rule » | page de méthode énonçant périodes et règle | T-1b-site non construit |
| « Bell applies these properties to its own records » | les quatre lignes ci-dessus | conditionnel : vrai au dépôt seulement si T-1b et T-1b-site sont servis (pivot factuel de l'avis, AVIS l.75) |
| faits go-1 (§3 *Recomputable*, *Anchored digests* : 3 mints, verdicts, 12/15) | aucun (faits passés, sourcés §3) | vrais aujourd'hui |

## 7. Contrôles (rejouables, §11)
- **C-1 gate du dépôt** : `node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v3.md` (depuis `F:\Monark`) ⇒ « gate:vocab OK —
  scanned 225 file(s), no forbidden claim. », exit 0 ⇒ **0 hit** (motifs GLOBAL sur la cible + rescannage du dépôt).
- **C-2 harnais tous scopes** (`scratchpad/v2/check-vocab-v2.mjs`, réutilise `compilePatterns`/`scanText` du gate) : global, monark, site,
  skills, narabi_docs, sentinel, bell = 0 ; **harness = 5** (D-v3-12, ruling 141). Liste C-12 : 0 partner, autonomous, guarantee,
  **verified**, score, live, built, standard, interval, proven, probability, confidence, **accuracy**, price band, ±, reference price,
  endorse, approve, first ; « only » ×1 restrictif (« complete only if ») ; « certif » ×1 négation (« not a certification ») ; « independen »
  ×1 = revendication de Bell, jamais attribuée à la SEC ; « attestation » ×1 (D-v3-10). `grep -i` : 0 « will », 0 « verif », 0
  « first-hand », 0 « NEAR »/« Ondo »/« near.com », 0 « fail-closed », 0 « budget », 0 « orchestrator », 0 « transfers », 0 « prior month »,
  « for each session » ×1 = la phrase Q3 (l'écart g EST par session ; aucune occurrence en Q6), 0 « 8,783 ».
- **C-3 citations** (`scratchpad/v2/check-v2.mjs`, sha `0b266bc4…71de`, inchangé) : 14 spans entre guillemets = **13 citations de l'ordre**
  localisées mot pour mot, page citée = page réelle, 0 écart, max 15 mots, + « Tokenized Stocks » (titre, non-citation attendue). Lignes :
  p.57 l.2028 ; p.28 l.1086 ; p.17 l.672-673 ; p.35 l.1337 ; p.26 l.1012-1013 ; p.28 l.1076-1077 ; p.12 l.464-465 ; p.44 l.1605-1606 ;
  p.57 l.2039-2040 ; p.57 l.2043 ; p.58 l.2047-2048 ; p.2 l.30 ; p.29 l.1129-1131 (×2 : notes 81 et 82, même page). Référence sans
  citation : II.A p.18 (« deployed on a public, permissionless distributed ledger », l.694-695, re-lue ce tour).
- **C-4 structure** : 14 placeholders, un par ligne ; tableau GFM 6 lignes, 5 barres non échappées chacune (`check-md-tables.mjs` :
  0 ligne fautive) ; **CR = 0 octet** (`tr -cd '\r' | wc -c`) ; aucune clé, IP, adresse courriel ni UUID ; seules URLs : les adresses
  publiques attendues dans les placeholders `url_state`/`url_timeline`.
- **C-5 mots** (`scratchpad/v2/wordcount.mjs`, même méthode que v2) : **v3 = 1 318** (v2 = 1 661) ; par section
  (`scratchpad/v3/section-words.mjs`, sha `4066aa01…49dd`) : en-tête + résumé 103, §1 259, §2 333, §3 502, §4 86, §5 35. Cible mission
  « ~1 300 max » : **dépassée de 18 mots** ; le critère de pages est tenu (C-6).
- **C-6 pages** (`scratchpad/v3/render-v3.mjs` sha `022befef…30b0` → RTF → LibreOffice headless LOCAL, profil isolé du scratchpad →
  `pdfinfo`/`pdftotext` ; valeurs représentatives à la place des placeholders) : **12 pt, interligne 1,15 : 3 pages** (492 / 424 / 435 mots
  rendus ; PDF de mesure `v3j-12pt.pdf` sha `de068973…d18c` ; rendu-image de la page 3 `v3j-p3-3.png` sha `e0e7278b…a89d` : ≈ 3 lignes
  libres sous la signature) ; 11 pt / 1,15 : 3 pages (614 mots en p.2, 197 en p.3) ; 11 pt / 1,05 : 3 pages (129 en p.3). **Calibration** : le même pipeline rejoue la v2 à 12 pt = 4 pages, 330 mots en p.4
  (identique à RENDU-v2 C-5). **Fragilité déclarée** : à 12 pt la marge est de ≈ 3 lignes ; un texte `relation_commerciale` plus long que la
  valeur représentative (11 mots) ou des URL plus longues peuvent faire déborder la signature ⇒ re-mesure au remplissage (I-v3-6).
- **C-7 v2 et squelette intacts** : sha `01de804a…be6d` et `3f27e46b…c239c` identiques avant/après.

## 8. Items formés (propriétaire + déclencheur ; zéro dû nu), clôtures
| # | Item | Propriétaire | Déclencheur |
|---|---|---|---|
| I-v3-1 | Période du ratio Q6 : le code (fenêtre de collecte ; ADV glissant 45 j) ≠ ADR-B0 D2 (iii) l.30 et ADR-T1aii l.16 (« mois précédent ») ≠ lettre v2 (« each session », « prior month ») — choisir : aligner le code sur II.F (mois civil précédent, par session) OU amender les ADR à la définition réelle ; la page de méthode l'énonce ; test non-LLM (ex. mutant « fenêtre 45 j ⇒ mois civil » rouge) ; la lettre suit (« over a period stated in its method ») | orchestrateur → worker du lot porteur (T-1b ou -b1-bis-ii) | G0 T-1b, avant la rédaction de `/bell/method` ; au plus tard avant remplissage de `url_method` |
| I-v3-2 | Rafraîchir la phrase OTS au dépôt : `ots upgrade` + `ots verify` (client épinglé) sur toutes les preuves (dont `mint_end-SPYx`, `final`), commit des preuves mises à niveau, réécrire « N of M anchor proofs upgraded to Bitcoin attestations on <date>; the remaining K are published as they upgrade » (successeur de I-v2-4) | orchestrateur | remplissage des placeholders / G2 texte final |
| I-v3-3 | Extension optionnelle de la démonstration à SPYx (« For TSLAx, AAPLx, NVDAx and SPYx »), sans chiffre | orchestrateur | `mint_end-SPYx` ancré avec `scan_complete true` et verdict `equal` |
| I-v3-4 | Emplacement PUBLIC des manifestes + `.ots` (le dépôt est privé, décision 76) lié depuis `/bell/method` ; sinon réécrire « are published as they upgrade » | orchestrateur (T-1b-site) | T-1b-site |
| I-v3-5 | Ruling C-12 sur « Bitcoin attestations » (terme OTS dans la phrase dictée) | orchestrateur | avant G2 texte |
| I-v3-6 | Rejouer `check-v2.mjs`, `check-vocab-v2.mjs`, `grep-forbidden.mjs`, `wordcount.mjs`, `measure.sh` (12 pt) sur le texte REMPLI (successeur de I-v2-8) | orchestrateur (G2 texte C-11) | après remplissage |

**Clôtures / reclassements d'items v2** : I-v2-2 (agrégat I-5) et I-v2-3 (exceed2) **ne sont plus requis par la lettre** (phrase et
lignes retirées) — restent des items produit si l'orchestrateur le décide ; I-v2-4 → remplacé par I-v3-2 ; I-v2-6 (AI-7) **clos** par
la décision 141 (« operated by MONARK ») ; I-v2-9 **clos** par le ruling 141 (scope `harness` non appliqué). Reportés inchangés :
I-v2-1, I-v2-5 (AI-11), I-v2-7 (AI-6 : aucune phrase prospective, `under_calib` absent), I-v2-10 (pagination/attribution GTM), I-v2-11
(lettres du dossier) ; PR-v2-1 (opérateur de l'endpoint public Solana) reste optionnelle (la lettre dit « a second endpoint »).

## 9. Ce que je n'ai pas pu établir (et ce qui est formé à la place)
1. **Validité cryptographique des 12 attestations** : seulement la présence des tags et hauteurs (V3-1) ; `ots verify` = acte
   orchestrateur (I-v3-2).
2. **Si T-1b calculera un ratio par session et sur le mois civil** : conception non écrite ⇒ I-v3-1 (pas une supposition dans la lettre).
3. **Si la page de méthode énoncera périodes et règle du jour du close** : T-1b-site non construit ⇒ condition portée par `url_method`.
4. **Si un TSV publie déjà ainsi** (le « tue » de l'avis, AVIS l.75) ou si un tiers du dossier a déjà réclamé ces propriétés : 11 lettres
   du dossier non lues, aucun TSV opérant au census ⇒ demande formée de l'avis maintenue (AVIS §5 n°4 = I-v2-11, lecture sur place par
   l'orchestrateur ; WAF jamais contourné).
5. **Demandes de procurement de l'avis** (AVIS §5 n°1-3, 5 : rapport Kaiko Research du 07/09/2026, Coin Metrics/Talos SotN #369, Kaiko ×
   Lise, « Statement on Tokenized Securities » staff SEC janvier 2026) : non traitables par le worker (sans réseau) ; la v3 ne cite
   AUCUN de ces acteurs ni chiffres ; demandes formées telles quelles dans l'avis, routage = orchestrateur (lecture sur place).
6. **Tenue de la marge de 3 pages à 12 pt après remplissage** : ≈ 3 lignes ; re-mesure I-v3-6.

## 10. Sources lues (sha256 recalculés ce tour ; niveaux)
| Fichier | sha256 | Portée | Niveau |
|---|---|---|---|
| `docs/sec-4927/LETTRE-4-927-v2.md` | `01de804a…be6d` | intégral | [lu] |
| `docs/sec-4927/RENDU-v2.md` | `7920317a…349e` | intégral | [lu] |
| `docs/sec-4927/AVIS-advisor-marche-v2.md` | `e2806cdf…ae00` | intégral | [lu] (contenu : [lu]/[abs-WF]/[2nd] déclarés par l'avis ; aucun de ses [abs-WF]/[2nd] repris dans la lettre) |
| `docs/sec-4927/SOURCES.md` ; `NOTE-DEPOT.md` ; `FAITS-lettre-ross-4-927-2026-09-23.md` | `463f3738…040b` ; `c09ef74e…cfa0` ; `a6dee725…04de` | intégral | [lu] (Ross = [lu-orch]) |
| `docs/CHANTIERS.md` | `c1f2459e…0a07` (HEAD `b89ad29`) | l.59, 119-123, 215, 838, 898, 915, 921, 964, 992 | [lu] |
| `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` | `c54b7675…fe31` | l.8, 16, 236, 397-606 | [lu] |
| `docs/adr/ADR-B0-programme-bell.md` | `aaefd7f2…ac63` | l.20-32 | [lu] |
| `docs/course-bell/ANCHORS.md` ; `*-manifest.txt` (3 `mint_end`) ; `*.ots` (15) | `d8d88928…f974a` ; V3-2 ; V3-1 | intégral ; intégral ; octets | [lu] + recalcul |
| commit `766402e` | `766402ec…d500d4` | `--stat` + message | [lu] |
| `apps/bell/src/collect.ts` ; `volume.ts` ; `sessions.ts` | `67d7091f…9fb1` ; `d521dd87…6083` ; `6aaec1e6…0ba3` | l.80-84, 106-270, 375-392, 425-436, 530-565 ; l.1-49 ; l.140-147 | [lu] |
| `F:\Monark-wt-bellexec\apps\bell\src\rebase-crosscheck.ts` (`a703e24`) | `6a2b96ef…a98c` | l.247-345 | [lu] |
| `F:\course-bell\bell-b3d-run-{tslax,aaplx,nvdax}-completion\crosscheck-*.json` | V3-2 | champs `n_exact`, `pages`, `scan_complete`, `comparator_verdict`, `oracle_slot` | [lu] |
| Ordre 34-106402 (texte pré-extrait) | `adee69f6…4d08d` | l.452-470, 885-1135, 1596-1612, 2018-2070 | [lu] |
| `vocab-banned.json` ; `scripts/grep-forbidden.mjs` | `f74f8e61…cdd5` ; `fe0566b8…baff` | motifs + scopes | [lu] |

Aucune source [2nd] nouvelle ; aucun chiffre de marché ; Cong et al. repris de la v2 ([lu+img], V-10 du RENDU-v2, valeurs inchangées).

## 11. Rejeu (R-21) — commandes
- `<sp>` = `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad`.
- Lettre : `node <sp>/v2/check-v2.mjs F:/Monark/docs/sec-4927/LETTRE-4-927-v3.md` ; `node <sp>/v2/check-vocab-v2.mjs <idem>` ;
  `cd F:/Monark && node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v3.md` ; `node <sp>/v2/wordcount.mjs <v2> <v3>` ;
  `node <sp>/v3/section-words.mjs <v3>` ; `node <sp>/v2/check-md-tables.mjs <v3>` ; `grep -c '<<' <v3>` ; `grep -o '<<' <v3> | wc -l` ;
  `tr -cd '\r' < <v3> | wc -c`.
- Pages : `bash <sp>/v3/measure.sh <sp>/v3/render-v3.mjs <v3> v3j-12pt 24 276` (idem `22 252`, `22 231`) ; calibration :
  `bash <sp>/v3/measure.sh <sp>/v2/render-v2.mjs <v2> cal-v2-12pt 24 276` (attendu 4 pages, 330 mots en p.4).
- OTS : `git show 766402e --stat` ; `node <sp>/v3/ots-heights.mjs F:/Monark/docs/course-bell`.
- Mints : `sha256sum` + lecture des champs de `F:/course-bell/bell-b3d-run-{tslax,aaplx,nvdax}-completion/crosscheck-*.json` ;
  `cat F:/Monark/docs/course-bell/mint_end-*-manifest.txt`.
- Code : `sed -n '247,345p' F:/Monark-wt-bellexec/apps/bell/src/rebase-crosscheck.ts` ; `sed -n '375,392p;425,436p;186,200p;240,270p'
  F:/Monark/apps/bell/src/collect.ts` ; `sed -n '140,147p' F:/Monark/apps/bell/src/sessions.ts`.

Aucun commit (R-20), aucun workflow, aucun appel réseau ; écritures : deux fichiers sous `docs/sec-4927/` + scratchpad de session.
