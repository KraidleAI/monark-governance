# NOTE DE DÉPÔT — lettre de commentaire SEC File No. 4-927 (MONARK Bell)

**Provenance** : worker `claude-opus-5-5[1m]` (R-1), 2026-09-23 (UTC) ; sources : ordre 34-106402 pré-extrait (sha `adee69f6…`, lu intégralement), `docs/biblio/bell/R-gtm-bell-sources.md` l.106-107, `docs/CHANTIERS.md` l.55 / l.915-916, FAITS transmis par l'orchestrateur ; réviseur = orchestrateur (R-21). **Statut** : le texte est un SQUELETTE (`LETTRE-4-927-squelette.md`) ; **rien n'est déposé** ; le dépôt est un acte investisseur, après T-1, sous go explicite (CHANTIERS l.55 « VALIDÉE, après T-1, go avant dépôt » ; ADR-B0 D7 l.61 « lettre SEC 4-927 sous go (décision 3) »).

## 1. Mécanique de dépôt — verbatim de l'ordre (p.59-60, l.2083-2100) [lu]

Concorde mot pour mot avec `R-gtm-bell-sources.md` l.106 [lu]. Citations ≤ 25 mots chacune (texte d'une agence fédérale).

| Canal | Verbatim | p., l. |
|---|---|---|
| Formulaire internet | « Use the Commission's internet comment form (https://www.sec.gov/comments/4-927/order-granting-temporary-conditional-exemptive-relief-pursuant-section-36a1-securities-exchange-act); or » | p.59 l.2084-2086 |
| Courriel | « Send an email to rule-comments@sec.gov. Please include File Number 4-927 on the subject line. » | p.59 l.2087-2088 |
| Papier | « Send paper comments to Secretary, Securities and Exchange Commission, 100 F Street NE, Washington, DC 20549-1090. » | p.59 l.2090-2091 |
| Référence | « All submissions should refer to File Number 4-927. This file number should be included on the subject line if email is used. » | p.59 l.2092-2093 |
| Un seul canal | « To help the Commission process and review your comments more efficiently, please use only one method. » | p.59-60 l.2093, l.2096 |
| Publication | « The Commission will post all comments on the Commission's internet website (https://www.sec.gov/rules-regulations/2026/09/4-927). » | p.60 l.2096-2097 |
| Données personnelles | « Persons submitting comments are cautioned that we do not redact or edit personal identifying information from comment submissions » ; « you should submit only information that you wish to make available publicly. » | p.60 l.2098-2100 |

**Conséquences opérationnelles** :
- **Objet du courriel** (si canal courriel) : `File Number 4-927` — proposé : `File Number 4-927 - Comments on Questions 3 and 6 (MONARK Bell)` (acte investisseur).
- **Un seul canal** : jamais formulaire ET courriel pour la même lettre.
- **Tout ce qui est soumis devient public et n'est pas expurgé** : nom, titre, organisation, adresse de contact.
- **Aucune date de clôture** : la section VI (p.57-60, lue en entier) n'en stipule aucune ; l'ordre dit seulement « intends to monitor closely the use of the exemptions » (p.57 l.2028) ; exemptions en vigueur jusqu'au 17 septembre 2031 (p.57 l.2022). PR-GTM-2 clos (R-gtm l.107). Le calendrier est donc un choix investisseur, borné par la règle « après T-1 ».
- **Pagination** : la section VI est aux pages imprimées **57-60** (et non 56-59 comme écrit dans ADR-B0 l.133, GTM l.113, R-gtm l.27/103 — item I-1).

## 2. Faits lus sur place par l'orchestrateur — 2026-09-22 ~23:4x UTC [lu-orch, transmis par message ; non relus par le worker : aucun réseau]

Page `https://www.sec.gov/rules-regulations/public-comments/4-927` (navigateur interne) :
- **14 lettres « Public Comment »** datées du 17 au **22 septembre 2026** ; la dernière (Varun Srivastava / Ha Pham, NeuFin Inc.) est datée du 22 et était **déjà en ligne le 22** ⇒ délai de publication ≤ 1 jour **mesuré sur UN cas** (observation, pas une règle de la Commission).
- Colonnes « Date Received / Letter Type / Commenter Name » ; **« Commenter Name » affiche nom + titre + organisation tels que soumis** (ex. « Tyrone V. Ross Jr., CEO, Founder Turnqey Labs »).
- Chaque lettre a un **permalien public** `sec.gov/comments/4-927/<id>.html` (format déjà en dépôt pour Ross : R-gtm l.93, l.154).
- Lien « How to submit comments » ; « Related Materials : Release No. 34-106402 ».

**Conséquences** : (a) le signataire et l'organisation apparaîtront publiquement, de façon permanente, tels que saisis ⇒ **choix du signataire = acte investisseur** ; (b) après dépôt, **le permalien sec.gov est le lien partageable** (communauté, tweet).
**Écart avec le dépôt** : GTM-BELL l.64/l.113 et R-gtm l.91 comptent 8 lettres (17-18/09) ; le dossier en compte 14 au 22/09 — 11 lettres n'ont été lues par personne (3 seulement en [lu-WF] ; leurs copies en dépôt sont des pages d'erreur WAF) ⇒ checklist C-8.

## 3. Actes investisseur (jamais le worker ; l'orchestrateur prépare, l'investisseur décide)

| # | Acte | Pourquoi | Source |
|---|---|---|---|
| AI-1 | **GO de dépôt** | règle du programme | CHANTIERS l.55 ; ADR-B0 D7 l.61 |
| AI-2 | Choix du **canal unique** (formulaire OU courriel ; papier non recommandé) | « please use only one method » | ordre p.60 l.2096 |
| AI-3 | **Signataire** : nom, titre, **organisation** (champ public « Commenter Name », permanent, non expurgé) | PII publique ; « MONARK » n'est pas encore une société constituée (création de la société = LEGAL-ATLAS, décision 94, ROADMAP l.18) | ordre p.60 l.2098-2100 ; FAITS §2 |
| AI-4 | **Date** de la lettre = date du dépôt | — | placeholder `<INVESTISSEUR:date_de_depot>` |
| AI-5 | Déclaration « aucune relation commerciale avec les émetteurs et venues mesurés » à la date du dépôt | la lettre revendique l'indépendance vis-à-vis d'eux (§3) ; au 2026-09-19 « aucun … démarché » | GTM l.56, l.60 ; placeholder `<INVESTISSEUR:relation_commerciale>` |
| AI-6 | Options entre crochets : (i) phrase `under_calib` (seulement si T-3 servi) ; (ii) phrase prospective « We intend to apply the same method to TSV pools » | (i) concept T-3, absent du code T-1 ; (ii) engagement public prospectif | ADR-B0 D3 l.37 ; GTM l.115 |
| AI-7 | Formulation de l'opérateur (« operated and deployed by the MONARK orchestrator ») — conserver la formule ESC-2, la simplifier (« by MONARK ») ou l'expliciter (un lecteur de la Commission ne sait pas ce qu'est « the MONARK orchestrator ») | formule décidée pour `/bell/method` ; cohérence entre surfaces publiques vs clarté pour le régulateur | ADR-B0 ESC-2 l.129 |
| AI-8 | Offre « We would be glad to provide the underlying records to Commission staff » — **retirée du squelette** pour tenir en 3 pages ; ajout possible si le rendu le permet | engagement de mise à disposition | NOTE-DEPOT C-14 |
| AI-9 | Contact public | PII publique | placeholder `<INVESTISSEUR:contact>` |
| AI-10 | Publication parallèle de la copie signée + tweet : **go par action** | surface publique | décision 101 (CHANTIERS l.412-416) ; décision 73 (l.212 : rien en ligne avant validation visuelle de l'investisseur) |
| AI-11 | Ton : garder ou retirer la phrase « The word "independent" does not appear in the Order » (fait vérifié par recherche exhaustive, mais seule phrase de §1 portant sur une ABSENCE, adressée à l'auteur du texte) | choix de ton, avec l'advisor-marché | SOURCES O-13 |

## 4. Checklist pré-dépôt (bloquante, dans l'ordre ; chaque case = une preuve rejouable consignée par l'orchestrateur)

- [ ] **C-1 — T-1 complet.** Course go-1 de recoupement complète 4/4 + ancre `final` (ANCHORS) ; -b3d-b2 publié seulement si `equal` 4/4 ∧ H1 stricte ∧ H3 (G0-b3d-b l.249) ; course fondatrice **-b1-bis-ii** terminée et `docs/MESURE-FONDATRICE-bell-2026-09.md` produit par `bell-report.mjs --founding` (ADR-T1aii l.71, l.101, item #11 l.362) ; T-1b backend servi (timeline signée, clé publique, DNS). *Nota* : la source des chiffres Q3 n'est PAS -b3d-b2 seul (item I-4).
- [ ] **C-2 — Chiffres depuis les artefacts ANCRÉS.** Chaque `<BELL:…>` rempli depuis un fichier nommé (sha256 consigné) figurant dans un manifeste horodaté OTS ; aucune valeur saisie à la main ; **recalcul orchestrateur** (R-21) : rejeu de la série réduite (`bell_course_reduced_series_replays_vwap_and_chain`) + recompte de la statistique Table 4 (abs(exp(g) − 1) > 1/2/5 %, `gap.ts` l.74-77) ; aucun close ni ADV dans le texte (ESC-1 c ; C-6).
- [ ] **C-3 — Agrégat mensuel de la condition F** défini, épinglé et testé (item I-5) avant de remplir `volm_*` (le `vol_ratio` servi est par SESSION) ; sinon retirer toute la phrase entre crochets [COND I-5] de §2.
- [ ] **C-4 — Branchement** (règle absolue « une pièce n'est built que si elle est branchée ») : table « phrase au présent de §3/§5 → chemin servi → test d'intégration non-LLM » vérifiée au jour du dépôt ; toute phrase sans chemin servi est retirée ou mise au futur ; Bell reste `upcoming` jusqu'à la Définition de fini (ADR-B0 D8, après T-2) : la lettre ne dit jamais « built » ni « live ».
- [ ] **C-5 — Ancres.** `<BELL:anchored_runs>` = liste des courses ancrées ; preuves OTS mises à niveau (Bitcoin) ; si la course fondatrice n'est pas ancrée : l'ancrer ou restreindre la puce « Anchored » aux courses ancrées (item I-7).
- [ ] **C-6 — Pages complètes.** BELL-SHORTPAGE-1 fusionné (G7) et appliqué aux courses dont viennent les chiffres ; sinon restreindre la puce « Complete pages ».
- [ ] **C-7 — Disponibilité.** URLs servies (`state.json`, `timeline.jsonl`, page de méthode) ; la page de méthode **lie** effectivement la clé publique, l'emplacement public des manifestes + `.ots` et le **code de rejeu public** (export `apps/bell`, non exporté avant T-1b : CHANTIERS l.59) — sinon retirer/scoper « anyone can recompute » et « with the published replay code » ; pages site validées visuellement par l'investisseur (décision 73).
- [ ] **C-8 — Dossier 4-927 relu.** Lecture SUR PLACE (navigateur ; curl est bloqué par le WAF sec.gov, jamais contourné) de toutes les lettres au dossier à la date (14 au 22/09 + nouvelles) : aucune contradiction factuelle avec notre texte ; aucune revendication de nouveauté dans notre texte ; relevé des signaux « confirme »/« tue » (GTM §6 l.123-126) — prolonge PR-GTM-1 (item I-3).
- [ ] **C-9 — Référence Cong** : id/URL SSRN confirmés sur place (`<REF:cong_ssrn>` ; l'id 5937314 ne figure pas dans le texte du papier).
- [ ] **C-10 — Relecture advisor-marché** (positionnement, objection « auto-publication par le TSV », ton).
- [ ] **C-11 — G2 texte** (relecteur frais ≠ rédacteur) : rejouer `check-letter.mjs` sur le texte final (toutes les citations localisées, ≤ 25 mots) ; chaque phrase ↔ `SOURCES.md` ; aucune affirmation au-delà des sources ; décision 69 respectée (aucun nom de fournisseur).
- [ ] **C-12 — Gate vocabulaire sur le texte FINAL** (placeholders remplis, options tranchées) : motifs de `vocab-banned.json` (tous scopes) + mots publics interdits (ROADMAP l.3 : partner, autonomous, guarantee, verified, score ; GTM l.7 : live, built, bande de prix, ±X, probabilité par événement) + « standard » (ROADMAP l.22) + « attestation » pour une sortie Bell + formes du nom du fournisseur de recoupement (test racine `no_cash_cross_provider_name_in_export`, décision 69) + « first »/« only ». **Décision orchestrateur due** sur le scope applicable : le squelette rougit le scope `harness` (motif « tout pourcentage ») sur 12 occurrences attendues (seuils et parts de la Table 4, limites 0,25/2,5 %) ; 0 hit sur les autres scopes (RENDU).
- [ ] **C-13 — Nettoyage** : retirer le bandeau interne et tous les crochets [OPTION] / [COND I-5] (AI-6 tranché ; I-5 livré ou phrase retirée) ; **remplacer les numéros de ligne (« ll. », extraction interne invérifiable par la Commission) par page + section/item de l'ordre** (table `SOURCES.md` §D) — les lignes restent dans SOURCES ; échapper/retirer les `\|` du tableau selon le format de sortie.
- [ ] **C-14 — Rendu** : PDF format Letter, **≤ 3 pages** vérifié à l'écran ; sha256 du PDF et du texte ; horodatage OTS du texte final (optionnel, go investisseur). **Mesure faite sur le squelette** (valeurs représentatives courtes substituées aux placeholders, options conservées = pire cas ; `scratchpad/render-rtf.mjs` → RTF → LibreOffice headless local → `pdfinfo`) : **3 pages** en Times 11 pt, marges 1 pouce, interligne 1,05 ou 1,15 (≈ 15 % de page 3 libre à 1,15) ; **4 pages en 12 pt** (7 lignes de trop). Si le format final impose 12 pt : couper d'abord le paragraphe « A third-party record complements… » (§3, fusionnable dans le résumé), puis la parenthèse de O-15 et la phrase AI-11.
- [ ] **C-15 — Clôture** : verdict orchestrateur + acceptation validateur-humain selon le cadrage AgileGates retenu par l'orchestrateur (une clôture n'est jamais auto-déclarée par un générateur).
- [ ] **C-16 — GO investisseur explicite** (AI-1) ; canal (AI-2) et signataire (AI-3) saisis par l'investisseur ou sous son contrôle.

## 5. Après dépôt (plan transmis par l'orchestrateur ; chaque action = go)

1. **Attendre le permalien** `sec.gov/comments/4-927/<id>.html` ; délai observé ≤ 1 jour sur un cas (§2) — ne rien annoncer avant la mise en ligne.
2. **Publier en parallèle notre copie signée** (texte + PDF) avec sha256 + ancre OTS sur `bell.monarkgate.tech` — go par action ; validation visuelle investisseur (décision 73) ; site hors gates mais règles non négociables : gate vocabulaire et mots interdits, aucun close en clair, aucun nom de fournisseur de recoupement (décision 101, CHANTIERS l.414).
3. **Tweet** = texte public sous gate vocabulaire + **relecture conjointe investisseur-orchestrateur (décision 101)** + go par action ; lien = permalien sec.gov ; **jamais une affirmation au-delà du texte de la lettre** ; jamais « approved/endorsed » ni rien qui suggère une position de la Commission. *Candidat NON validé (à relire conjointement)* : « We submitted a comment letter on SEC File No. 4-927 (Release 34-106402), Questions 3 and 6: what our public record of off-hours trading in tokens tracking U.S. equities measures, how anyone can recompute it, and its limits. <permalien> » (0 hit au gate sur ce candidat : à rejouer sur le texte final).
4. **Consigner** (orchestrateur, CHANTIERS) : permalien, date de mise en ligne observée, sha256 de notre copie, `ots_ref` ; KPI « lettres File 4-927 citant Bell » (GTM §6 l.127).
5. **Veille** du dossier : nouvelles lettres (signaux GTM §6).

## 6. Items formés liés au dépôt
Renvoi : `RENDU.md` § « Items formés » (I-1 … I-13 : propriétaire, déclencheur, zéro dû nu).

## 7. Mise en ligne observée (orchestrateur, lecture sur place, 2026-09-25 20:29 UTC)
- Liste `https://www.sec.gov/rules-regulations/public-comments/4-927` : « Sept. 24, 2026 | Public Comment | Stan E. Malone, Founder, MONARK ».
- Lien public de la lettre : `https://www.sec.gov/comments/4-927/4927-1073299-3717506.pdf` (PDF servi directement ; pas de page `.html`, dépôt « Comments attached »).
- Preuve : GET 200, 122 152 octets, `Last-Modified: Fri, 25 Sep 2026 17:56:16 GMT`, sha256 `76261d1edd706027ed82587138f28c4267428ba5977c918ba5ef234cf66f512c` = copie déposée `F:/PRODUITS/sec-4927/LETTRE-4-927-v4-2026-09-24.pdf` (byte-identique).
- Délai dépôt → mise en ligne : 24/09 16:18Z → 25/09 17:56Z (≈ 26 h). Dossier : 24 lettres au 25/09.
- Suite (§5) : annonce X après relecture conjointe (décision 101) ; copie signée + `.ots` sur `bell.monarkgate.tech` sous go.
