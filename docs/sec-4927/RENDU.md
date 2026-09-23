# RENDU — squelette lettre SEC File No. 4-927 (MONARK Bell)

Modèle résolu : claude-opus-5-5[1m]
(R-1 : préfixe attendu `claude-opus-5-5` — à vérifier par l'orchestrateur avant consommation.)

Début de mission : 2026-09-22T23:38:32Z (horloge `date -u` du worker).
Mode : docs-only, aucun commit (R-20), aucun réseau, écriture limitée à `F:\tmp\sec4927\`.
Écriture « au fil de l'eau » (consigne investisseur) : ce fichier est complété à chaque étape.

## Journal d'avancement
- [23:38Z] Répertoire `F:\tmp\sec4927\` créé ; RENDU.md initialisé (R-1).
- [23:4xZ] Lecture en cours : ADR-B0 (178 l.), GTM-BELL (163 l.), R-gtm-bell-sources (169 l.), ordre 34-106402 texte intégral (2 116 l., lu INTÉGRALEMENT avec carte ligne→page, 60 pages), L6 (Cong), L7 (SEC).
- [23:5xZ] **Message orchestrateur reçu en cours de mission (FAITS lus sur place, navigateur interne, 2026-09-22 ~23:4x UTC, `https://www.sec.gov/rules-regulations/public-comments/4-927`)** : 14 lettres « Public Comment » datées 17→22 sept. 2026 ; dernière (Srivastava/Pham, NeuFin Inc.) datée du 22/09 et en ligne le 22/09 ⇒ délai de publication ≤ 1 jour mesuré sur ce cas ; colonnes Date Received / Letter Type / Commenter Name (nom + titre + organisation tels que soumis) ; permaliens `sec.gov/comments/4-927/<id>.html` ; lien « How to submit comments » ; « Related Materials : Release No. 34-106402 ». À intégrer dans NOTE-DEPOT.md (signataire = acte investisseur ; permalien sec.gov = lien partageable ; copie signée sha256 + ancre OTS en parallèle ; tweet sous gate vocabulaire + relecture conjointe « décision 101 » + go par action). Niveau : [lu] orchestrateur (première main, pas du worker) — cité comme tel.
- Constats de lecture déjà établis (détail en D-n plus bas) : (1) les 3 fichiers `docs/biblio/bell/_txt/sec-4927-comment-*` sont des pages d'erreur WAF sec.gov « Request Rate Threshold Exceeded » (1 925 o chacune) — le texte des lettres N'EST PAS en dépôt ; seul existe un extrait [lu-WF] (WebFetch, résumeur intermédiaire) dans R-gtm-bell-sources §7 ; (2) la section VI « Solicitation of Comments » est aux pages IMPRIMÉES 57-60 (l.2026-2100), pas 56-59 comme écrit dans ADR-B0/GTM/R-gtm (décalage d'une page) ; (3) le mot « independent » n'apparaît NULLE PART dans l'ordre (grep exhaustif, 0 occurrence).

## Sources lues (sha256 au moment de la lecture ; dépôt `F:\Monark` HEAD `dde21eb7461b23ddc775391a142064cbd8643a18`, branche `lot/etude-suite`)
| Fichier | sha256 | Portée de lecture |
|---|---|---|
| `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt` | `adee69f69189aee2031773337f5e251963c2dfba85ea37be8b6a226e40b4d08d` | INTÉGRAL (2 116 l., 60 p.) ; bit-identique à `pdftotext -layout` du PDF (sha PDF `67bfb89a0d2497787e6366c716312097e921198b82cb152491b7cf7a30360b18`, poppler mingw64, recomputé ce tour) ; carte ligne→page par comptage des sauts de page (60 `\f`), page imprimée = page PDF (vérifié : pied « 57 » sous la section VI, `pdftotext -f 57 -l 57`) |
| `F:\PRODUITS\etude-2026-09-19\ssrn-5937314.pdf` / `txt\ssrn-5937314-tokenized-stocks.txt` | `bb8b64b549aefb7ea9360d472af3ae3734157ae54a106bbb9524b9cf13a18d60` / `c4a2c899183fa708d79d67534723e005b7e33eddb3c2a48c76c6abaefe08d9fd` | ciblée : en-tête/abstract, §4.9 + Table 4 (p. imprimée 32 = page PDF 33) ; Table 4 confirmée par RENDU-IMAGE de la seule page 33 (doc 03 §6) |
| `F:\PRODUITS\etude-2026-09-19\L6-lecture-cong-tokenized-stocks.md` | `0c105823ee6fbe1bb19afe476952bd087cffb98e000d7f9f0ebab517a2e8b280` | intégral |
| `F:\PRODUITS\etude-2026-09-19\L7-lecture-sec-34-106402-et-IAC.md` | `b23e293452992e44673bbbbf2bb3664d0c4a2964f339148894d7fa4a38f14a65` | intégral (paraphrase ; « Pagination ±1 » déclaré par son lecteur) |
| `docs/adr/ADR-B0-programme-bell.md` | `aaefd7f21a13527078d9e0fc5d852274132db5896e8b4663b2cfbcf5a385ac63` | intégral (dont amendement 2026-09-19 l.132-135) |
| `docs/GTM-BELL.md` | `479c62de25b4ead84d6d93fdc4a7c6b400e263069099500c0bab6cc12bcd3b41` | intégral |
| `docs/biblio/bell/R-gtm-bell-sources.md` | `20979af29323aa2d8636a9fd399e8ed74188836fa70c0abb6842f5f8d8ee3494` | intégral |
| `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` | `378d720428d7fc782615b260e48513d73c37df0001fd732b45110cf161f1fb1d` | intégral |
| `docs/ROADMAP-BELL.md` | `cdc76276dc9adfe260443271727201baf6d739f3ef7cf1fd37613069e9a3590d` | intégral |
| `docs/course-bell/ANCHORS.md` | `5dc1d735e411f28fc1512846ee8ce4af23f813624670bf7f25bb9c44ed7cf5e1` | intégral |
| `docs/course-bell/FICHE-GO-1.md` | `136acf7397edf3b140f81d2ff83932bb68d7237aab20a5562ecb146209211e80` | l.1-140 + grep ciblé (C-8, pages courtes) |
| `docs/course-bell/INCIDENT-powercut-2026-09-22.md` | `042c6010c89d8ae919ee2646af2fe57ea1342d4448586a6d979b602c2c0bcb78` | intégral |
| `docs/CENSUS-ACTIONS-TOKENISEES-v4-2026-09-20.md` | `d8369449beb5a01fd9e52a7dad02ce34210c2ca185844d01ecff373a2c308bcb` | intégral |
| `docs/CONSIGNE-STANDARD-G1.md` | `961ae242516486458ff73e6a91e383f3dbd8521bed8f3a6ca18bb4bd70694746` | intégral (G-1, A-13) |
| `docs/CHANTIERS.md` | `738a6303bcccde4035b03ff1ffc76d6c24adee228395a774fa7a8375b79d0d20` | ciblée : l.45-65 (l.55), 208, 223, 412-416 (décision 101), 881-917 (BELL-SHORTPAGE-1, AAPLx, décision 138, FAITS 4-927) |
| `vocab-banned.json` | `f74f8e61f185bd2ff887c8bcb9eda048ac4b872fda85b51a4d6db48909e2cdd5` | intégral |
| `docs/G2-lot-bell-shortpage-1.md` | `807fa7fb7e9bdadb7f37ea7b8c7bd1d7c8d91dab8fcb811e1b2bc4a14867dc97` | l.1-80 (définition opératoire de l'ancre C-8) |
| `docs/G0-lot-t1a-ii-b3d-b.md` | `87742ca293234d03ad0bcb4287671f20275bb5db08c0ca6b760ab722e8167344` | grep ciblé « b2 » (l.25, 247-249) |
| `docs/biblio/bell/_txt/sec-4927-comment-{ross-turnqey,borthwick-insumer,delderfield-pro}` | `f53244a0…`, `4f98d058…`, `203dff96…` | intégral : **pages d'erreur WAF sec.gov (« Request Rate Threshold Exceeded »), 1 925 o chacune — PAS les lettres** |

## Constats de lecture (D-n candidats, détaillés dans la section D-n finale)
- F-1 : pagination de la sollicitation = p. 57-60 (l.2026-2100), pas 56-59 (ADR-B0 l.133, GTM l.113, R-gtm l.27/103 portent le décalage).
- F-2 : « independent » = 0 occurrence dans l'ordre (grep insensible à la casse) ; « third-party audits » = exemple de l'item x (p.44 l.1604) avec « If the TSV does not have such procedures, state so in the Notice » (p.44 l.1609-1610) ; item i (p.39 l.1456-1458) NE porte PAS la clause « if none, state so » — GTM-BELL l.18 et l.60 la lui attribuent à tort (item formé pour l'orchestrateur, le worker n'édite pas GTM).
- F-3 : le texte des 3 lettres n'est pas en dépôt (pages WAF) : seul existe un extrait [lu-WF] (R-gtm §7) ⇒ la lettre ne cite AUCUNE lettre du dossier ; l'objection « auto-publication par le TSV » est traitée sans nommer d'auteur.
- F-4 : source attendue des chiffres Q3/Q6 ≠ « -b3d-b2 » seul : -b3d-b2 publie l'attestation du recoupement de trajectoire de multiplicateur (G0-b3d-b l.25, 247-249) ; la statistique Table 4 sur données Bell vient de la course fondatrice rebase-aware **-b1-bis-ii** (`bell-report.mjs --founding` → `docs/MESURE-FONDATRICE-bell-2026-09.md`, ADR-T1aii l.71, 101, 362) ; chemin critique ROADMAP l.6 : -b3d-b → course → -b3d-b2 → R1 → -b1-bis-ii → -b3c → T-1b.
- F-5 : unité Cong Table 4 = « share of observed HOURS » (p.32, caption) ; unité Bell = part des SESSIONS (g_t par session VWAP) — ADR-T1aii D2 l.19 « leurs heures ≠ nos sessions » ⇒ comparaison descriptive, unité écrite dans la lettre.
- F-6 : décision 69 (CHANTIERS l.208/223) : aucun nom du fournisseur de recoupement cash sur une surface publique ⇒ la lettre ne nomme AUCUN fournisseur de données (ni RPC, ni close).
- F-7 : l'hôte de la course go-1 est la machine de l'orchestrateur (INCIDENT l.6), pas le VPS ; le VPS dédié porte la publication/signature (ADR-B0 D8, ESC-2) ⇒ la lettre distingue « hôte de publication/signature » et « collecte ».

## Journal (suite)
- [~23:47Z, horodatage corrigé à 00:01Z : l'entrée portait par erreur l'heure LOCALE UTC+1 lue sur un `ls`] Lectures terminées ; RENDU durable écrit AVANT l'appel advisor (risque filtre de régurgitation : extraits Cong dans le transcript).
- [~23:50Z, corrigé idem] **Advisor intégré consulté (avant écriture)** — avis (conseil, pas verdict) retenu point par point :
  (1) `under_calib` = concept T-3 (ADR-B0 D3), absent du code servi à T-1 — **vérifié** : 0 occurrence dans `apps/bell/src` ; enum fermé des résidus = `apps/bell/src/residuals.ts` l.15-42 (sha ci-dessous) ⇒ la lettre décrit l'abstention par résidus nommés comptés/publiés ; `under_calib` en phrase optionnelle entre crochets [si T-3 servi au dépôt] ; D-n « la mission conflate T-1 et T-3 ».
  (2) population mesurée possiblement HORS définition de l'ordre (p.2 l.28-31, « synthetic exposure ») ⇒ dit en §2 ET §4 (« la méthode se transfère, la population non »).
  (3) Q3 : g_t = ampleur/fréquence de l'écart hors séance vs dernier close consolidé, par régime ; ni ouverture ni clôture du sous-jacent, aucune phrase causale.
  (4) OTS = manifestes de FRONTIÈRES de course (ANCHORS l.15-28), pas chaque ligne de `timeline.jsonl` ; limite verbatim ANCHORS l.12-13 en §4.
  (5) quorum : énumération mono-opérateur déclarée (`authority_scan_mono_operator`, ADR-T1aii l.235-237, 269-271).
  (6) ne pas citer p.36 l.1375 (mot « accuracy ») ni aucune citation portant un mot interdit.
  (7) sources des placeholders : Q3 → `docs/MESURE-FONDATRICE-bell-2026-09.md` (lot -b1-bis-ii) ; Q6 → `state.json` `vol_ratio` (ratio seul, ADR-T1aii C-6) ; -b3d-b2 → attestation de recoupement de trajectoire seulement.
  Contraintes implicites retenues : Branchement (chaque phrase au présent ↔ chemin servi + test au jour du dépôt ; jamais « built »/« live ») ; latence ≤ 10 min = cible non revendiquée ; PII/canal unique (p.60 l.2096-2100) ; « MONARK » avant incorporation = acte investisseur ; « ni TSV ni Covered Firm » en §4 ; jamais « attestation » pour une sortie Bell ; tier non affirmé (ratio face aux deux seuils) ; halts : aucune mesure ni question évoquée (seule la condition H est citée comme texte de l'ordre, exigence de la mission — D-n de réconciliation) ; objection auto-publication traitée sans nommer d'auteur ; auto-contrôle du gate vocabulaire rapporté.
  Écart assumé vs l'avis : tableau Cong réduit aux 2 colonnes « Tesla xStock » (Bell ne mesure pas Ondo ; colonnes Ondo non comparables) — D-n.
- [~23:55Z, corrigé idem] Vérifications complémentaires avant rédaction : (a) « independ » = 0 occurrence même après recollage des césures de fin de ligne (`sed` sur `-\n`) et recherche `indep[a-z-]*` sur le texte à plat ; (b) `apps/bell/src/volume.ts` (sha `d521dd87cda344e99538fcb50bbb40b4feed188a8970bd47f4807a623de86083`) : `vol_ratio` = volume de la SESSION (en actions via multiplicateur) / ADV consolidé du mois précédent — ce n'est PAS la moyenne mensuelle de la condition F ⇒ agrégat mensuel à définir (item formé) ; (c) VPS Bell : CHANTIERS l.119-123 (décisions 54/57) — hôte dédié à Bell + « sonde externe » Narabi/Bell, clé SSH de déploiement = celle du VPS site ⇒ la lettre écrit « runs only Bell and an external monitoring probe » et « not independent of MONARK ».
- [00:01Z, `date -u`] **LIVRABLE 1 écrit** : `LETTRE-4-927-squelette.md` (sha256 provisoire `b33c9464cf78ec4c1ab90db1ae74cc47ccee64dffb17e55fa73065edc2cadf3d`, sha final en fin de RENDU). Harnais de vérification (`scratchpad/check-letter.mjs`, écrit par l'outil Write — A-13) : 18 spans entre guillemets ; 16 localisés VERBATIM dans le texte de l'ordre (page/ligne imprimées par le harnais, toutes ≤ 25 mots, max 18) ; 2 non-citations attendues (`"independent"` = le mot dont l'absence est affirmée ; `"Tokenized Stocks"` = titre du papier Cong) ; corps = 1 589 mots hors placeholders et bandeau interne (options incluses) ; 29 placeholders distincts ; gate vocabulaire (80 motifs, tous scopes) : 12 hits, TOUS du scope `harness` (motif « tout pourcentage ») — seuils 1/2/5 % de Cong, parts du tableau, limites 0,25/2,5 % : attendus par construction, à trancher par l'orchestrateur (la lettre n'est pas une surface `harness`) ; 0 hit global/bell/site/skills/monark/narabi_docs/sentinel.
- [00:0xZ] Vérif. `apps/bell/src/gap.ts` (sha `9dd168afc3527810b52c7f7b2c433f1509c7fe8158bf94d71500b6238410f914`) l.74-77 : `exceeds(gT, pct)` = |exp(g_t) − 1| > pct/100 ⇒ seuil sur l'écart RELATIF (comme Cong « deviated by more than the given threshold »), pas sur le log — cohérent avec la phrase de la lettre. Rédaction de SOURCES.md en cours.
- [~00:05Z, entre les relevés `date -u` 00:01:18Z et 00:08:31Z] **LIVRABLE 2 écrit** : `SOURCES.md` (§A affirmation → source fichier:ligne/page + niveau ; §B omissions volontaires motivées ; §C 29 placeholders : grandeur, fichier attendu, lot producteur, condition). Lignes de code re-confirmées par grep (volume.ts l.34-48, gap.ts l.74-77/89, residuals.ts l.15-42) et corrigées dans SOURCES avant clôture. Rédaction de NOTE-DEPOT.md en cours.
- [00:0xZ-00:08Z] **LIVRABLE 3 écrit** : `NOTE-DEPOT.md` (mécanique verbatim p.59-60 l.2083-2100 ; FAITS orchestrateur §2 intégrés ; actes investisseur AI-1..AI-10 ; checklist pré-dépôt C-1..C-16 ; plan après dépôt : permalien, copie signée sha256+OTS, tweet sous gate + décision 101 + go par action — candidat de tweet NON validé, 0 hit au gate étendu).
- [00:08Z] Relecture adversariale propre de la lettre (auto-R-21) ⇒ 4 corrections : résumé (« in particular while U.S. markets are closed » : Bell publie aussi les sessions régulières, ADR-B0 D2 i) ; condition F citée l.902-908 (l.906-908 = « a TSV must aggregate ») ; condition G « updated within ten minutes » (fidélité) et H « primary listing exchange » ; Q3 reformulée en deux membres fidèles au texte (impact + effets du reporting 10 min et de l'« overnight trading ») ; « precondition of any effect » (causal) remplacé par « an input to, not a measure of, any effect ». Harnais rejoué : 16/16 citations localisées, ≤ 18 mots ; 1 608 mots ; 29 placeholders ; gate : 12 hits `harness` (%) attendus + gate étendu (mots publics ROADMAP/GTM, « standard », « attestation », « first/only », noms de fournisseurs) : « attestations » = mot de la Commission dans la citation de l'item i (pas une sortie Bell) ; 6 « only » tous restrictifs (aucune revendication de nouveauté) ; 0 nom de fournisseur.

## D-n — décisions et écarts du worker (chacun motivé, vérifiable)
- **D-1** Pagination : la lettre cite la section VI aux p. **57-60** (texte primaire, pied de page imprimé ; `pdftotext -f 57 -l 57`), non 56-59 (ADR-B0 l.133, GTM l.113, R-gtm l.27/103) ⇒ item I-1.
- **D-2** Aucune lettre du dossier n'est citée ni nommée : les 3 copies en dépôt sont des pages WAF (sha §Sources) ; seul existe un extrait [lu-WF] ⇒ rien n'est [lu] ⇒ l'objection « auto-publication par le TSV » (remède Ross, ADR-B0 l.134) est traitée sans auteur (§3, dernier paragraphe) ⇒ item I-3.
- **D-3** Condition H citée comme TEXTE de l'ordre seulement (la mission exige E/F/G/H/J en §1) ; aucune mesure de halt, aucune question sur les halts, aucune autre mention (réconciliation mission ↔ avis « zéro halts »).
- **D-4** Tableau Cong réduit aux colonnes « Tesla xStock » (Bell ne mesure pas Ondo : colonnes non comparables) — écart assumé vs l'avis advisor (« 4 colonnes »).
- **D-5** `under_calib` seulement en [OPTION] : concept T-3 (ADR-B0 D3 l.37), 0 occurrence dans `apps/bell/src` (grep rejoué) ⇒ item I-6. La mission le listait comme élément de méthode : non affirmable à T-1.
- **D-6** Q6 : la lettre annonce un « monthly ratio » (comparable à F) qui n'est PAS servi aujourd'hui (`vol_ratio` = session / ADV, `volume.ts` l.34-48) ⇒ item I-5 (définition ; période du numérateur non explicitée par l'ordre l.902-906 ; date de négociation de la note 69, p.25 l.959-965 ; test non-LLM).
- **D-7** Sources des placeholders Q3 = lot **-b1-bis-ii** (`MESURE-FONDATRICE`), pas « -b3d-b2 » (prémisse de la mission) ; -b3d-b2 n'alimente que `crosscheck_verdicts` ⇒ item I-4.
- **D-8** Aucun fournisseur de données nommé (close, ADV, RPC) : décision 69 lue de façon conservatrice ; exemples de résidus choisis hors `cash_cross_*`.
- **D-9** Indépendance : « separate host that runs only Bell and an external monitoring probe » (décision 57, CHANTIERS l.120) + « independence … from the venues and issuers measured …, not from MONARK » (ESC-2 l.129 ; clé SSH de déploiement partagée avec le VPS site, l.123) — la formule de la mission « indépendant de l'hôte (VPS dédié) » est précisée pour rester vraie.
- **D-10** Ancrage limité aux manifestes de frontières de course (ANCHORS l.15-31), pas aux lignes de `timeline.jsonl` (ADR-B0, alternatives rejetées l.100 : pas d'ancrage on-chain des timelines) ; placeholder `anchored_runs` ⇒ item I-7.
- **D-11** Quorum : « two distinct operators wherever the same method exists on both » + exception mono-opérateur déclarée (`authority_scan_mono_operator`) ; la re-dérivation exhaustive est une seconde MÉTHODE, pas un second opérateur.
- **D-12** « Pages pleines ou prouvées finales » rendu par la règle opératoire (sonde de continuation vide ET ancre C-8 égale, sinon arrêt) ; mot « proven » évité (scope `skills`).
- **D-13** Décision 138 appliquée sans sur-lecture : aucun « void/gap » attribué à la Commission ; l'absence du mot « independent » est énoncée comme fait vérifiable (recherche exhaustive) ; le lecteur conclut.
- **D-14** Appartenance des sous-jacents aux tiers LULD NON affirmée (Appendix A non lu) : ratio présenté face aux deux limites ⇒ item I-9 (optionnel).
- **D-15** Caractérisation des xStocks (« tracker certificate », [lu-WF] census v4) NON reprise : la lettre dit seulement « no representation » + citation de l'exclusion (p.2 l.30) ⇒ item I-11 (optionnel).
- **D-16** Id SSRN de Cong en `<REF:…>` (absent du texte du papier ; vient du nom de fichier + L6 l.1) ⇒ item I-8.
- **D-17** Horodatages RENDU : 3 entrées portaient par erreur l'heure LOCALE (UTC+1, lue sur un `ls`) et une 4ᵉ un créneau approximatif ; corrigées (`date -u`), correction visible dans le journal.
- **D-18** Longueur : 1 608 mots bruts (hors placeholders/bandeau, options incluses), à la borne haute de « ≤ 3 pages » ; liste de coupes pré-déclarée si le rendu dépasse 3 pages (C-14) : (1) offre §5 « We would be glad… » (AI-8) ; (2) « Pre-market and after-hours sessions are published separately. » ; (3) parenthèse de la puce *Recomputable*.
- **D-19** Candidat de tweet ajouté dans NOTE-DEPOT §5 (non explicitement demandé) : marqué « NON validé », relecture conjointe (décision 101) + go par action ; 0 hit au gate étendu.
- **D-20** La lettre reprend la formule ESC-2 « operated and deployed by the MONARK orchestrator » (cohérence avec `/bell/method`) ⇒ acte investisseur AI-7 (conserver ou préciser).
- **D-21** Q3 citée par un extrait de 11 mots + paraphrase fidèle ; Q6 paraphrasée (≤ 25 mots respecté partout).

## Items formés (zéro dû nu : propriétaire + déclencheur ; le worker n'édite rien hors `F:\tmp\sec4927\`)
| # | Item | Propriétaire | Déclencheur |
|---|---|---|---|
| I-1 | Corriger la pagination de la section VI (p.56-58/59 → **p.57-60**) dans ADR-B0 l.133, GTM-BELL l.113, R-gtm l.27 et l.103 (L7 l.25 aussi ; « Pagination ±1 » y est déclaré) | orchestrateur | prochain commit touchant ces docs ; au plus tard G7 du lot « lettre 4-927 » |
| I-2 | Corriger GTM-BELL l.18 et l.60 : la clause « if the TSV does not have such procedures, state so » n'appartient PAS à l'item i (p.39 l.1456-1458) mais aux items v (p.43 l.1585-1586), w (p.43 l.1592-1593), x (p.44 l.1609-1610) ; item bb : « state that in the Notice » (p.45 l.1648-1649) | orchestrateur | idem I-1 |
| I-3 | **Demande de procurement formée** — textes des lettres du dossier File No. 4-927 (14 au 2026-09-22 [lu-orch], permaliens `https://www.sec.gov/comments/4-927/<id>.html`, liste `https://www.sec.gov/rules-regulations/public-comments/4-927`). Tentatives : curl → 403 WAF (copies en dépôt = pages d'erreur de 1 925 o, R-gtm l.116) ; WebFetch → [lu-WF] pour 3 lettres (R-gtm l.93-101) ; session du worker hors réseau. Usage : checklist C-8 (cohérence, aucune revendication de nouveauté) + signaux GTM §6. Prolonge PR-GTM-1. **Jamais de contournement du WAF** : lecture sur place (navigateur interne puis externe). | orchestrateur (lecture sur place) | avant dépôt (C-8) |
| I-4 | Sources des chiffres : Q3 ← `docs/MESURE-FONDATRICE-bell-2026-09.md` (-b1-bis-ii, `bell-report.mjs --founding`, item #11 d'ADR-T1aii l.362) ; Q6 ← `state.json` + I-5 ; `crosscheck_verdicts` ← course go-1 + -b3d-b2 | orchestrateur | remplissage (C-1/C-2) |
| I-5 | Agrégat mensuel comparable à la condition F : définir (numérateur = moyenne des volumes JOURNALIERS des pools en actions via le multiplicateur ; période du numérateur non explicitée par l'ordre l.902-906 ⇒ convention Bell DÉCLARÉE ; jour de négociation selon la note 69, p.25 l.959-965 ; dénominateur = ADV consolidé du mois précédent déjà calculé ; ratio seul publié, C-6 ; `multiplier_unit` compté), épingler dans `bell-report`, test d'intégration non-LLM + mutant (déplacer la borne du jour de négociation ⇒ agrégat différent) | orchestrateur → worker (lot porteur au choix : -b1-bis-ii ou T-1b) | avant remplissage de `volm_*` (C-3) |
| I-6 | Phrase [OPTION] `under_calib` : ne la garder que si T-3 est servi et testé au jour du dépôt | orchestrateur / investisseur (AI-6) | date de dépôt |
| I-7 | Vérifier que les courses dont viennent les chiffres de la lettre (go-1 ; -b1-bis-ii) sont ancrées (manifeste + OTS mis à niveau) ; sinon ancrer (procédure décision 124) ou restreindre la puce *Anchored* | orchestrateur | avant remplissage de `anchored_runs` (C-5) |
| I-8 | **Demande de procurement formée** — référence Cong : Lin William Cong, Wayne Landsman, Daniel Rabetti, Che Zhang, Wenqi Zhao, « Tokenized Stocks », décembre 2025, 51 p. (PDF de l'étude, sha `bb8b64b5…`) ; id SSRN présumé 5937314 (nom de fichier + L6 l.1). Tentative : recherche dans le texte du papier (aucun id SSRN ni DOI propre ; seules des références tierces). Usage : référence bibliographique de la lettre. | orchestrateur (lecture sur place) | avant dépôt (C-9) |
| I-9 | (optionnel) Appartenance Tier 1/Tier 2 des sous-jacents : lecture première main de LULD Plan Appendix A (+ composition S&P 500) si l'investisseur veut l'écrire | orchestrateur → lecteur | seulement si la lettre doit affirmer un tier |
| I-10 | Décision de scope du gate vocabulaire pour une lettre publique hors scopes scannés (12 hits `harness` « tout pourcentage » attendus) | orchestrateur | C-12 |
| I-11 | (optionnel) Caractérisation juridique des instruments mesurés : lecture première main de la documentation émetteur (census v4 l.68, procurements déjà formés) | orchestrateur → lecteur | seulement si la lettre doit caractériser les instruments |
| I-12 | Déclaration « aucune relation commerciale avec les émetteurs/venues mesurés » à la date du dépôt | investisseur (AI-5) | dépôt |
| I-13 | Mettre à jour GTM-BELL l.64, l.113, l.125 et R-gtm l.91 (« 8 lettres, 5 non lues ») : 14 lettres au 22/09 [lu-orch], 11 non lues | orchestrateur | prochaine mise à jour du GTM |

## Rejeu des vérifications (R-21) — commandes
- Texte de l'ordre = `pdftotext -layout` du PDF : `pdftotext -layout sec-34-106402-innovation-exemption.pdf - | sha256sum` ⇒ `adee69f6…` (= fichier pré-extrait) ; `grep -c` des sauts de page ⇒ 60 ; `pdftotext -layout -f 57 -l 57 <pdf> -` ⇒ section VI + pied « 57 ».
- Absence de « independent » : `grep -i -c independen <txt>` ⇒ 0 ; après recollage des césures ⇒ 0 ; texte mis à plat, motif `indep[a-z-]*` ⇒ aucune occurrence.
- Citations et gate : `node F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\check-letter.mjs` (16/16 localisées, mots, gate) ; gate étendu : `node …\scratchpad\check-vocab.mjs <fichier>`.
- Table 4 de Cong : `pdftoppm -f 33 -l 33 -r 110 -png ssrn-5937314.pdf cong-p33` ⇒ image lue (valeurs et légende).
- `under_calib` : `grep -rn under_calib F:\Monark\apps\bell\src` ⇒ 0.

## Livrables — sha256 (état au 2026-09-23T00:11:08Z, AVANT la revue advisor finale — PÉRIMÉ, remplacé par la table finale en fin de fichier)
| Fichier | sha256 |
|---|---|
| `F:\tmp\sec4927\LETTRE-4-927-squelette.md` | `b3921927f0fc5be43e4789becbca2c80d690d2269569b4834d21c503a9266403` |
| `F:\tmp\sec4927\SOURCES.md` | `bdbd11d45d69bc48a79eec746ff56ce0ff952d5117087bd0164da2673c2b835f` |
| `F:\tmp\sec4927\NOTE-DEPOT.md` | `a3f83d64920c9e98079447036f44cf3ea7d6b7ac424ab6886d1c498164384690` |

(Incident d'outillage consigné : la première écriture de ce tableau par commande Bash a perdu les noms de fichiers — le transport de l'outil Bash réduit `\\` en `\` (CONSIGNE A-13), ce qui a échappé le `$` de la variable ; corrigé par l'outil Edit.)
| `F:\tmp\sec4927\RENDU.md` | (auto-référence impossible ; sha donné dans le message de rendu final) |
- [00:11:10Z] Livrables durables ; appel de l'advisor intégré pour revue finale AVANT rendu (consigne de mission).

## Revue advisor finale (intégré, ~00:12Z) — traitement point par point (conseil, pas verdict)
- **(a) Tableau Markdown cassé par le `|` des placeholders** — CORRIGÉ : `\|` dans les 6 cellules concernées ; contrôle `scratchpad/check-table.mjs` : 5 lignes de tableau, 6 pipes non échappés chacune (0 écart). Défaut que mon harnais masquait (il retirait les `|` avant comptage) — `error_origin` : worker.
- **(b) « Two data operators » : les deux énumérations tournent sur le même opérateur unique** — CORRIGÉ : la puce dit désormais que les événements trouvés et l'état final du mint sont relus sur deux opérateurs (ADR-T1aii l.226-229, l.230-234, D1-sexies l.328) et que la re-dérivation exhaustive est faite « on the same operator » ; phrase « Some historical enumerations rely on a single operator » RESTAURÉE en §4. `error_origin` : worker (coupe de longueur qui retirait la seule phrase honnête).
- **(c) Q6 au présent sur une pièce inexistante** — CORRIGÉ : §2 Q6 décrit ce qui EST calculé (ratio par session, `volume.ts` l.34-48) ; l'agrégat mensuel « condition F » est entre crochets `[COND I-5 …]` (retiré si I-5 n'est pas livré, NOTE-DEPOT C-3).
- **(d) « bit for bit »** — CORRIGÉ : « … with the published replay code » (arithmétique flottante : `gap.ts` l.103-104, `volume.ts` l.45-48).
- **(e) item x = Systems Safeguards** — CORRIGÉ : « examples of systems-safeguard procedures ».
- **(f) numéros de ligne dans une lettre publique** — conservés dans le squelette (exigence de mission) ; NOTE-DEPOT C-13 impose leur remplacement par page + section/item au texte final ; table de correspondance `SOURCES.md` §D.
- **(g) 3 pages** — MESURÉ au lieu d'estimé : rendu RTF → PDF par LibreOffice headless LOCAL (aucun réseau ; profil isolé dans le scratchpad), valeurs représentatives courtes à la place des placeholders, options gardées (pire cas) : **3 pages** en Times 11 pt, marges 1 pouce, interligne 1,05 et 1,15 ; **4 pages en 12 pt** (7 lignes de trop). Pour y arriver, coupes faites (sans perte de fond) : phrase pre/after (la règle reste dans SOURCES Q3-3), parenthèse de la puce *Recomputable*, puce §4 « licence » (déjà en §3 M-1), puce §4 « signatures/ancres » (déjà en §3 M-3/M-5), puce §4 « résidus » (déplacée en §3 M-9), offre « records to Commission staff » (AI-8, optionnelle), en-têtes du tableau raccourcis, §5 : clé publique/ancres/code de rejeu désormais LIÉS depuis la page de méthode (exigence portée par `url_method`). Page images vérifiées (`lr115-2.png`, `lr115-3.png`).
- **(h) légende Cong / source du close** — CORRIGÉ : « Units, closing-price sources, samples and session definitions differ » (sans l'expression « reference price », bannie au scope `sentinel`).
- **(i) ton** — deux actes investisseur ajoutés/précisés : AI-11 (phrase « independent ») et AI-7 (« the MONARK orchestrator » incompréhensible pour un lecteur de la Commission).
- **D-18 (mis à jour)** : longueur finale 1 557 mots bruts (hors placeholders/bandeau, options incluses) ; 26 placeholders ; la liste de coupes antérieure est remplacée par celle de NOTE-DEPOT C-14 (cas 12 pt).
- **D-22 (nouveau)** : les URLs `url_pubkey`, `url_anchors`, `url_replay` ne sont plus des placeholders de la lettre mais des liens EXIGÉS de la page de méthode (`url_method`) — réduction de longueur ; condition portée par NOTE-DEPOT C-7 et SOURCES §C.
- **D-23 (nouveau)** : rendu PDF de mesure produit HORS livrables (scratchpad) : `letter-render-115.pdf` sha256 `ee05c6d63768d7ecd6ba4db52c94ec89268676155f28c310922622cb8cabc276` — pas une version déposable (valeurs fictives de mise en page).

## Vérifications finales rejouées (00:28Z)
- `check-letter.mjs` : 16/16 citations de l'ordre localisées verbatim (max 18 mots) ; 2 non-citations attendues ; 1 557 mots ; 26 placeholders ; gate 80 motifs : 12 hits, tous scope `harness` (pourcentages attendus, I-10).
- `check-vocab.mjs` (80 motifs + 17 motifs de surface publique) : 20 hits = 12 `harness` + « attestations » (citation de l'item i) + 7 « only » tous restrictifs ; 0 nom de fournisseur, 0 « guarantee/verified/accuracy/confidence/score/partner/live/built/standard/first ».
- `check-table.mjs` : tableau GFM valide (5 × 6 pipes).
- Scripts de vérification (sha256) : `check-letter.mjs` `2890b1e21b48ca768ea801dd6f0dca45cee8ccf7d4dc1b4954f4957a399cc844` ; `check-vocab.mjs` `da03ffe8780034de962a6412a22bce0fec57e7b7a26311a3d35f486c4ed14087` ; `check-table.mjs` `1452afd6c0c3746fd00efec5fc536829c904e90b6f4c1672aec127b52b517027` ; `render-rtf.mjs` `a457acefe704464065fc65cfaab5d54a6e526ae050304b3991c26806e66cf385` (tous sous `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\`).

## Livrables — sha256 FINAUX (2026-09-23T00:28:43Z)
| Fichier | sha256 |
|---|---|
| `F:\tmp\sec4927\LETTRE-4-927-squelette.md` | `3f27e46b57fd32747aa58c245c468dd3ccfd2fd470d90ce8ba7fd187624c239c` |
| `F:\tmp\sec4927\SOURCES.md` | `463f3738abdbb39edf93e287c835f755dd4e97791b338ac1a434b8c201f3040b` |
| `F:\tmp\sec4927\NOTE-DEPOT.md` | `c09ef74e4251824e8f987652eeb47bbc99822aaa9e53351ae5706b8b5ef3cfa0` |
| `F:\tmp\sec4927\RENDU.md` | auto-référence impossible : sha256 donné dans le message de rendu final |

Aucun commit (R-20), aucun workflow, aucun appel réseau (LibreOffice et poppler exécutés en local ; aucune page web lue par le worker), aucune écriture hors `F:\tmp\sec4927\` et du scratchpad de session.
- **D-24** Écritures hors `F:\tmp\sec4927\` limitées au scratchpad de session désigné par l'environnement (`F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\`) : harnais de vérification, carte ligne→page, image de la page 33 de Cong, rendus RTF/PDF/PNG de mesure, profil LibreOffice isolé (`lo-profile`, 428 Ko) ; aucun fichier dans `F:\Monark`. LibreOffice peut utiliser le répertoire temporaire système pendant la conversion (non vérifié) — déclaré, sans effet sur les livrables.
- [00:3xZ] Rendu terminé ; RENDU clos (sha256 dans le message de rendu).
- [00:30Z] Stabilité des sources vérifiée au HEAD courant `390a6dc3ede1f83d6cb287083ab2255fd113dbdf` : `git diff --stat dde21eb 390a6dc` sur les 17 fichiers cités ⇒ seul `docs/CHANTIERS.md` change (+22 lignes APRÈS la l.919, hunk `@@ -915,5 +915,27 @@`) ; toutes les lignes citées (≤ l.916) sont stables ; arbre `F:\Monark` propre (aucune écriture du worker).
