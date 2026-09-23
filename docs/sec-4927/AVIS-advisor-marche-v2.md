# Avis advisor-marché — lettre SEC 4-927 v2 (claude-fable-5-1, 2026-09-23)

Modèle résolu : claude-fable-5-1

# AVIS advisor-marché — lettre 4-927 v2 (`F:\Monark\docs\sec-4927\LETTRE-4-927-v2.md`)

Avis, jamais verdict (R-21). Lecture seule ; rien écrit. Pièces lues [lu] : la lettre v2 (103 l.), `RENDU-v2.md`, `SOURCES.md`, `NOTE-DEPOT.md`, `FAITS-lettre-ross-4-927-2026-09-23.md`, `FAITS-near-ondo-2026-09-22.md`, `ANCHORS.md`, ADR-T1aii D1-nonies §1-7, `GTM-BELL.md`, CHANTIERS l.915-921, et le texte pré-extrait de l'ordre (`F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt`, l.462-465, 568-572, 1008-1031, 1072-1077, 1603-1607, 2026-2063) pour recouper les citations et lire Q3/Q6 en entier. Recherche externe : 6 requêtes + 2 pages primaires (Talos/Coin Metrics SotN #369 ; Kaiko × Lise) — niveaux [abs-WF]/[2nd] déclarés au §6.

## 1. Reformulation de la question marché

« Un lecteur de la Division of Trading and Markets qui a posé Q3 et Q6 trouve-t-il dans cette lettre une information qu'il n'a pas déjà — et la méthode Bell y est-elle présentée comme une réponse à sa question plutôt que comme une description de notre ingénierie ? » La consultation est bien posée ; une donnée manque pour y répondre pleinement : 11 des 14 lettres du dossier ne sont lues par personne (RENDU I-v2-11), donc « qui a déjà dit quoi à la SEC » reste partiellement inconnu.

## 2. Le vide, sur pièces

- **Ce que la Commission a écrit [lu]** : régime auto-déclaratif (chaque TSV calcule son ratio, II.F l.896-906 ; publie ses données, II.G) ; reconnaissance du risque d'erreur « miscalculation in either a numerator or denominator » (l.1012-1013) ; risque de dislocation (l.1073-1074) ; « intends to monitor closely » (l.2028) ; Q3 demande **aussi** « What, if any, modifications should be made » (l.2047-2048) ; Q6 demande si les limites sont « appropriate » (l.2057-2063). La Commission exprime un besoin d'**information et de propositions de modification**, et détient déjà son propre remède (examens « at any time », lettre l.18). Elle n'exprime **pas** un besoin de témoin tiers — SOURCES §B l'assume (« le lecteur conclut »).
- **Qui occupe le terrain « mesure du comportement hors séance »** : Cong et al. (déc. 2025, une fois, [lu+img]) ; Coin Metrics/Talos SotN #369 (24/06/2026, NVDAx vs NVDAon, parts de volume week-end, données propriétaires « Talos CM Reference Rates » — [abs-WF]) ; Kaiko Research (rapport du 07/09/2026, parts de volume hors séance NVDA/AAPL/AMZN — vu **uniquement via un relais BYDFi : [2nd], en quarantaine**) ; Kaiko × Lise (« independent, auditable pricing » pour titres tokenisés, [abs-WF], date non lue sur la page). Aucun ne publie un écart au dernier close **par session, recomputable, signé, avec abstention** : Talos mesure token-vs-token, Kaiko des parts de volume. Côté dossier 4-927 : Ross demande l'auto-publication par le TSV (FAITS-ross l.14), pas un tiers.
- **Verdict** : terrain **naissant, occupé par des vendeurs de données propriétaires** ; la niche de Bell est un whitespace de **packaging** (donnée publique + rejeu + signature + abstention), pas de techno. Le « vide exprimé » de la décision 138 est un cran au-dessus du texte primaire : le vide est **structurel et reconstruit par juxtaposition de citations** — ce qui est légitime si la lettre le dit ainsi et n'attribue rien à la Commission (elle ne le fait pas : bien).

## 3. Réponses aux six questions

### Q1 — Thèse démontrée ou glissement « constructible donc utile » ?

Démontrée **en forme** (15 citations localisées, aucune sur-lecture, rétraction correcte du mot « independent », SOURCES O-13 / RENDU I-3). Mais le glissement est réel dans le **poids relatif** : §3 (l.62-83) décrit le mécanisme Bell (pages, budget, tokens de pagination, rename) sur ~22 lignes, alors que **zéro phrase répond aux sous-questions « modifications » de Q3 (l.2047-2048) ni au « appropriate » de Q6**. Le point faible porteur pour un lecteur T&M est l.26 : la population mesurée est celle que l'ordre **exclut** (« synthetic exposure », l.30 de l'ordre), et l'engagement prospectif TSV a été retiré (AI-6 ii). Résultat : l.64 « The method, more than any single figure, is what we offer » lu par la SEC = « et donc ? ». Ce n'est pas un surclaim, c'est un **sous-fit** : la méthode est présentée comme un objet, pas comme une réponse. Voir la recommandation §4.

### Q2 — Passages faibles / hors sujet / trop techniques ; coupes 12 pt (~330 mots, RENDU C-5 n'en couvre ~100)

Par gain décroissant et risque croissant :
- (a) l.66-67 : les N_exact et nombres de pages (8,783,173 / 8,784…) + `nexact_SPYx` — chiffres de diligence interne (transactions du **mint**, pas de négociation ; RENDU D-v2-4), illisibles pour la Commission. Garder « every transaction of each token's mint, from its initialization to a pinned slot » sans les nombres (~45 mots).
- (b) l.72 puce « Declared budget » entière (~35).
- (c) l.71 : la RÈGLE « Every page but the last must be full » est ce qui oblige la divulgation 135(a) (« the short last page was accepted this way… ») ; sans la règle, une phrase suffit : une page défectueuse n'est pas enregistrée ; une course n'est complète que si la requête indépendante rend la dernière transaction enregistrée (~40).
- (d) l.78 « operated and deployed by the MONARK orchestrator and an external monitoring probe » → « operated by MONARK » (AI-7 ; un lecteur SEC ne sait pas ce qu'est un orchestrateur) (~25).
- (e) l.88 phrase NEAR × Ondo (~40, cf. Q5).
- (f) fusion « Signed » (l.77) dans « Recomputable » (l.76) (~20).
- (g) lignes « more than 2 percent » du tableau (l.33, l.36) : supprime la dépendance I-v2-3 (code non écrit) et 2 placeholders ; légende : « Cong et al. also report a 2 percent threshold » (~30).
- (h) l.46 `url_report` fondu dans `url_state` (~15).
- **Ne pas couper** : l.48 (bouclier causal — sans lui Q3 est lue comme une affirmation d'impact) ; II.L l.18 (montre la connaissance du régime ; le couper arrangerait la thèse) ; l.60 (« These pools are not TSVs… »).
- Hors sujet pour T&M : l.72 (budget), la parenthèse OTS l.74 si elle dit « 0 of 15 » (honnête mais affaiblit ; voir Q4). Le 12 pt est une contrainte interne, pas une exigence SEC (NOTE-DEPOT §1 n'en cite aucune) : à trancher par l'investisseur.

### Q3 — Surclaim résiduel, mot par mot

- l.12 et l.66 **« First-hand »** / « not a derived data feed » : les pages proviennent de l'énumération propriétaire d'un opérateur (`getTransactionsForAddress` Helius-exclusif, RENDU V-5) ; seuls les événements du multiplicateur sont relus sur l'endpoint public. Mot exact : « transaction-level ledger data, obtained through one operator's enumeration », pas « first-hand ».
- l.69 titre **« Two data operators »** puis « The pages come from one operator » : le lecteur SEC lit le titre comme le claim. Retitrer (« Cross-read on a second endpoint ») ou dire d'emblée « Pages: one operator; multiplier events: two ».
- l.26 **« The method transfers to TSV pools »** : présent assertif sur une population inexistante → « is designed to apply to ».
- l.76 **« bit for bit »** : tenable seulement si `url_method` lie le code exporté (déjà gaté par le placeholder l.97 — bien ; le rappeler au remplissage).
- l.12 **« fail-closed refusals »**, l.72 « budget_exhausted », l.81 codes `no_close_ref`… : jargon ; acceptable en §3 si réduit à un exemple.
- l.78-80 **« We claim independence… not from MONARK »** : correct et rare ; à garder, conditionné à `relation_commerciale` (l.79).
- Absents (vérifié RENDU C-4) : guarantee, verified, accuracy, certif (hors citation/négation), first-nouveauté, only-exclusif. Bien.
- **I-v2-9 (scope `harness` sur tout pourcentage)** : la règle vise « never a rate of being right » ; aucun % de la lettre n'est un taux de confiance — seuils Cong (l.28, l.32-37), limites de l'ordre (l.60), parts de sessions. L'appliquer interdirait de citer les limites 0.25/2.5 percent de l'ordre lui-même. **Avis : non**, avec règle de substitution déjà respectée : tout % Bell porte son dénominateur n et sa fenêtre (l.40-44). À consigner comme ruling orchestrateur, pas comme exception silencieuse.

### Q4 — Les 26 placeholders

- **DOIVENT être remplis** (13) : `DATE`, `SIGNATAIRE`, `contact`, `relation_commerciale` (fonde l.78-80) ; les 6 `t4_*` → 4 si les lignes 2 % sont coupées, `window_TSLAx`, `n_TSLAx_wkn`, `n_TSLAx_we` (tout le contenu empirique de Q3) ; `url_state`, `url_timeline`, `url_method` (sinon retirer « anyone can recompute », l.12, et « with the published replay code », l.76 — la lettre le prévoit) ; `ots_upgraded` (l.74) : « 0 of 15 » est honnête mais fais lancer `ots upgrade` avant dépôt (I-v2-4) ; si toujours 0, préférer une phrase sans compteur (« submitted; upgraded proofs are published as they become available »).
- **RETIRABLES sans affaiblir** (6) : `nexact_SPYx`, `verdict_SPYx` (restreindre l.66-70 aux trois mints terminés), `t4_*_gt2` ×2, `url_report` (fondu dans `url_state`), `residual_counts` (« counted and published in the state file » suffit).
- **CONDITIONNELS — retrait comme plan par défaut** (5) : `window_q6`, `volm_{TSLAx,AAPLx,NVDAx,SPYx}` (l.51-59). I-5 n'existe pas (RENDU V-7, D-v2-2) ; comparer un ratio de pools **non-TSV** aux limites d'un régime dont ils sont exclus est le passage le plus fragile de la lettre pour Q6. Garder l.50 (ratio par session publié) et l.60, retirer la phrase « Aggregated … (SPYx) ». I-5 devient un bonus, pas un bloquant de dépôt.
- Résultat : 26 → ~13-15.

### Q5 — NEAR × Ondo (l.88)

**Dilue.** (i) Énoncé prospectif (« A future version… is intended ») dans une section *Declared limits*, alors que l'énoncé prospectif TSV a été retiré (AI-6 ii) — incohérent ; (ii) la page primaire dit exécution **confidentielle** (FAITS l.16-18) : citer une distribution que le témoin ne peut pas voir, par construction ; (iii) Ondo « total return tracker tokens » (FAITS l.11) tombe aussi hors périmètre TSV — [analyse], pas un fait de la page ; (iv) lecture possible par la SEC : name-dropping d'une annonce de la veille. CHANTIERS l.921 cadre la décision 139 comme « contexte, pas un chiffre », pas comme obligation de mention. **Avis : couper** ; repli si l'investisseur tient à la mention : une subordonnée en §2 population (l.26), sans « future version » ni date. Décision investisseur (139) — je propose.

### Q6 — Valeur côté demande : qui a exprimé un besoin, qui occupe le terrain

- **Besoin exprimé** : la Commission — information et propositions (Q3/Q6, [lu]) ; Ross/Turnqey — « unverifiable from outside », remède = auto-publication TSV ([lu-orch]) ; 11 lettres non lues ⇒ le dossier ne peut pas être caractérisé (I-v2-11). Un commentaire « personal capacity » sur AMM aperçu en snippet (x.com, 22-23/09) : [2nd], non lu.
- **Acteurs nommés** : Kaiko (Research 07/09/2026 [2nd] ; Lise [abs-WF] ; se positionne « independent, auditable pricing » — c'est le vocabulaire de Bell, vendu en propriétaire) ; Coin Metrics/Talos (SotN #369, 24/06/2026, [abs-WF]) ; RWA.xyz (agrégation, GTM §3) ; Cong et al. (académique, une fois). Whitespace restant : public + signé + rejouable + abstention. Cette niche n'a **aucun acheteur démontré** (GTM §4 le dit déjà ; rien de neuf ici ne le renverse) ; la SEC n'achète pas. La valeur du dépôt est **positionnelle** : être cité. KPI honnête = une citation ultérieure (lettre du dossier, release, post de gouvernance) reprenant « recomputable by a third party ».
- **Aucun chiffre vu dans les snippets n'est utilisable** ($25 Md, $1,7 Md, 88,5 %, 41 %/17 %…) : tous [2nd]/[abs-WF], quarantaine.

## 4. Options et recommandation

| Option | Fit au besoin SEC | Capture de valeur | Risque | Suppose vrai |
|---|---|---|---|---|
| A. Déposer la v2 telle quelle (coupes de longueur seules) | Moyen : information oui, réponse aux sous-questions non | Positionnelle faible (lettre descriptive parmi 14+) | Lecture « brochure technique » ; passage Q6 fragile | Que la description suffise à être citée |
| B. **Reformuler §3 en propriétés vérifiables que la Commission pourrait attendre de la publication II.G d'un TSV** (recalculable par un tiers depuis le registre public ; abstention nommée plutôt qu'estimation ; digest publié/ancré ; dénominateur ADV daté), Bell cité comme démonstration existante hors TSV | Fort : répond à « modifications » (Q3) et à la mécanique des limites (Q6) tout en soulignant la méthode (138) | Positionnelle forte : c'est la phrase qu'une release peut reprendre | Touche AI-6 (engagement prospectif) ; ton « recommandation » à assumer | Que l'investisseur accepte de proposer, pas seulement décrire |
| C. Lettre courte « méthode seule », sans chiffres Q3/Q6 | Faible sur Q3/Q6 | Faible | Hors sujet pour les questions posées | — |

**Recommandation unique : B**, avec les coupes Q2 (a)-(h), les retraits Q4 et la coupe Q5. **Escalade investisseur** : B suppose une phrase de proposition (« the Commission could require… »/« a third party could recompute… »), ce que AI-6 a écarté pour la phrase TSV ; c'est une décision de valeur, pas la mienne. **Pivot factuel unique** : Bell peut-il **aujourd'hui** rejouer publiquement un écart et un ratio (T-1b servi + code exporté) ? Sans cela, B devient un surclaim et A s'impose. **Falsifiabilité** : confirme = une lettre ultérieure du dossier, une release ou un post de gouvernance reprend l'exigence « recomputable by third parties » ou cite Bell (KPI GTM §6) ; tue = un TSV auto-publie déjà fills/ratio en machine-readable avec digest (remède Ross), ou Kaiko/Coin Metrics publient l'écart au dernier close par session en accès public — le packaging est alors redondant.

## 5. Ce que je ne peux pas établir — demandes formées

1. **Rapport Kaiko Research du 07/09/2026 (Andrew Yang), « tokenized stocks off-hours »** — vu uniquement via BYDFi [2nd] ; identité exacte, URL kaiko.com/research inconnue ; tentative : recherche `site:kaiko.com` sans résultat. Usage : positionnement §3 GTM et Q6 ci-dessus (qui mesure quoi). Lecture sur place par l'orchestrateur.
2. **Coin Metrics/Talos SotN #369** (`talos.com/insights/state-of-the-network-369`, 24/06/2026, T. Ved & C. Duschang) — lu par WebFetch [abs-WF] ; à relire sur place pour [lu] avant tout usage en positionnement (chiffres 41 %/17 % en quarantaine).
3. **Kaiko × Lise** (`kaiko.com/news/lise-and-kaiko-partner-…`) — date non lue sur la page ; à relire sur place ; usage : acteur nommé sur « independent, auditable pricing ».
4. **Les 14 lettres du dossier 4-927** (C-8, I-v2-11) — sans elles je ne peux pas dire si un tiers a déjà réclamé une mesure externe ni si la v2 contredit un fait déposé. Lecture sur place (WAF : jamais contourné).
5. **« Statement on Tokenized Securities », staff SEC, janvier 2026** — cité par l'input Superstate au Crypto Task Force ([2nd], `sec.gov/files/ctf-written-inpiut-alexander-zozos-superstate-073126.pdf`) ; usage : vérifier qu'il ne pose pas déjà une attente de donnée tierce qui changerait la lecture du « vide ».
6. **Effet du dépôt** : aucune preuve qu'une lettre de commentaire descriptive d'un non-TSV soit citée ou lue par T&M ; demande non démontrée, dite telle quelle — c'est le KPI post-dépôt, pas un fait.

Rien d'autre à demander : les corrections ci-dessus sont toutes à la main de l'orchestrateur (texte) ou de l'investisseur (AI-6, 139, signataire, 12 pt).
