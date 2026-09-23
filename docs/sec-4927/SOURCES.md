# SOURCES — squelette de lettre SEC File No. 4-927 (MONARK Bell)

**Provenance** : worker `claude-opus-5-5[1m]` (R-1), effort max, 2026-09-22T23:38Z → 2026-09-23 (horloge `date -u`) ; contexte : mission orchestrateur « squelette lettre 4-927 », décision investisseur 138 ; dépôt lu en lecture seule `F:\Monark` @ `dde21eb7461b23ddc775391a142064cbd8643a18` (`lot/etude-suite`) ; aucun réseau ; réviseur = orchestrateur (R-21). Version alignée sur la lettre APRÈS la revue advisor finale (tableau échappé, puce « Two data operators » précisée, Q6 conditionnelle, coupes de longueur). Ce fichier est une donnée de vérification, pas une surface publique.

## 0. Conventions

- **Niveaux** : `[lu]` = lu de première main par ce worker dans cette session, au `fichier:ligne` indiqué (rejouable) ; `[lu+img]` = lu + rendu-image de la seule page concernée (doc 03 §6) ; `[lu-orch]` = lu SUR PLACE par l'orchestrateur et transmis par message (non relu par le worker : pas de réseau) ; `[lu-WF]` / `[abs]` = niveaux hérités des documents du dépôt, jamais remontés ; `[analyse]` = déduction du worker, signalée comme telle, jamais attribuée à une source.
- **Citation de l'ordre 34-106402** : `p.` = page IMPRIMÉE = page PDF (vérifié : 60 sauts de page, pied « 57 » sous la section VI, `pdftotext -f 57 -l 57`) ; `l.` = numéro de ligne dans `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt` (sha256 `adee69f69189aee2031773337f5e251963c2dfba85ea37be8b6a226e40b4d08d`), fichier **bit-identique** à `pdftotext -layout` du PDF `…\txt\sec-34-106402-innovation-exemption.pdf` (sha256 `67bfb89a0d2497787e6366c716312097e921198b82cb152491b7cf7a30360b18`) — rejouable : `pdftotext -layout sec-34-106402-innovation-exemption.pdf - | sed -n '<l>p'`. **Au texte final public, les numéros de ligne (extraction interne, invérifiables par la Commission) sont remplacés par page + section/item (table §D) — NOTE-DEPOT C-13.**
- **Localisation des citations** : harnais `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\check-letter.mjs` (node v24.15.0) — extrait chaque span entre guillemets de la lettre, le cherche VERBATIM dans le texte de l'ordre (espaces normalisés, lignes recollées), imprime page + lignes, compte les mots ; dernier rejeu : 16/16 citations de l'ordre trouvées, toutes ≤ 25 mots (max 18) ; 2 spans non-citations attendus (`"independent"`, `"Tokenized Stocks"`).
- **Placeholders** : `<BELL:nom|source>` = valeur mesurée/URL remplie par l'orchestrateur depuis un artefact ANCRÉ ; `<INVESTISSEUR:nom|…>` = acte investisseur ; `<REF:nom|…>` = identité bibliographique à confirmer sur place ; dans le tableau Markdown, le séparateur est écrit `\|` (GFM). `[OPTION …]` et `[COND …]` = texte conditionnel à trancher avant dépôt. Liste complète §C.

## A. Chaque affirmation de la lettre → source

### En-tête et résumé
| # | Emplacement | Affirmation | Source | Niveau |
|---|---|---|---|---|
| H-1 | adresse | Secretary, SEC, 100 F Street NE, Washington, DC 20549-1090 | ordre p.59 l.2090-2091 | [lu] |
| H-2 | objet | File No. 4-927 ; Release No. 34-106402 ; September 17, 2026 | ordre p.1 l.2, l.9 | [lu] |
| H-3 | objet/résumé | périmètre = Questions 3 et 6 seulement | ordre p.57-58 l.2039-2048 (Q3), p.58 l.2057-2064 (Q6) ; ADR-B0 l.133 (amendement 2026-09-19 : Q3/Q6 seulement, aucune question sur halts/audit) ; GTM-BELL l.113 ; CHANTIERS l.55, l.915 (décision 138) | [lu] |
| S-1 | résumé | Bell tient un registre public, signé, de la négociation de tokens suivant des actions US, en particulier hors séance | ADR-B0 D1 l.21, D2 l.24, D2 (i) l.28 (sessions régulière, pre, after, overnight, week-end, férié) — **au présent : vrai seulement après T-1b servi** (NOTE-DEPOT C-4) | [lu] + condition |
| S-2 | résumé | « designed so that anyone can recompute it » | ADR-B0 D8 l.74 (DoD « recalculable par un tiers disposant d'une licence de close ») ; ESC-1 (c) l.128 | [lu] |

### §1 — ce que l'ordre dit (toutes [lu], texte primaire ; mots comptés par le harnais)
| # | Citation / paraphrase | Page, lignes | Mots |
|---|---|---|---|
| O-1 | « will help the Commission evaluate the impact of trading Tokenized NMS Stock … on the national market system » (ellipse = « using AMM Liquidity Pools and the TSV trading model ») | p.14 l.570-572 | 17 |
| O-2 | « intends to monitor closely the use of the exemptions » | p.57 l.2028 | 9 |
| O-3 | « solicits public comment on all aspects of the exemptions » | p.57 l.2029-2030 | 9 |
| O-4 | condition E : « must verify » + paraphrase « holders get the rights and privileges of the traditional stock » (texte : « provides holders the same rights and privileges as does traditional NMS stock of an equivalent class ») | p.23 l.870-872 | 2 |
| O-5 | item i : « the steps (e.g., audits, certifications, attestations) » (mot « attestations » = celui de la Commission, décrivant les démarches du TSV — jamais une sortie Bell) | p.39 l.1456-1458 | 6 |
| O-6 | condition F : le TSV calcule son propre ratio (numérateur = volume journalier moyen du token sur le TSV ; dénominateur = ADV du titre « as reported by an effective transaction reporting plan » ; « a TSV must aggregate » avec ses TSV affiliés) | p.24 l.902-908 | paraphrase |
| O-7 | condition G : le TSV publie ses propres données de transaction, « updated within ten (10) minutes » (données « from the TSV » l.1110) | p.28 l.1085-1088 ; p.29 l.1110 | paraphrase |
| O-8 | condition H : arrêt « concurrently » avec un arrêt sur la « primary listing exchange » — **cité comme TEXTE de condition uniquement** (exigence de la mission « conditions E/F/G/H/J ») ; aucune mesure Bell de halt, aucune question sur les halts (ADR-B0 l.133) | p.30 l.1140-1142 | paraphrase |
| O-9 | condition J : « A TSV cannot engage in financing activities » (paraphrasé « engages in no financing activity ») | p.32 l.1256 | paraphrase |
| O-10 | « would not be subject to the same books and records, examinations, and other oversight requirements » (+ « applicable to national securities exchanges and ATSs » paraphrasé) | p.17 l.672-673 | 15 |
| O-11 | « at any time » (consentement aux examens des books and records par le staff) | p.35 l.1336-1337 | 3 |
| O-12 | « third-party audits » = exemple de l'item x **« Systems Safeguards »** (audits de code/systèmes, l.1600-1611) — d'où « systems-safeguard procedures » dans la lettre ; « state so in the Notice » | p.44 l.1600-1604, l.1609-1610 (même formule aux items v p.43 l.1585-1586 et w p.43 l.1592-1593 ; le harnais localise la 1ʳᵉ occurrence, item v ; la lettre cite l'item x) | 5 |
| O-13 | « The word "independent" does not appear in the Order » — affirmation d'ABSENCE, prouvée par recherche exhaustive : `grep -i -c independen` = 0 ; idem après recollage des césures de fin de ligne ; motif `indep[a-z-]*` sur le texte mis à plat = 0 (commandes au RENDU) ; **ton = acte investisseur AI-11** (garder ou laisser la liste des conditions parler) | ordre entier (l.1-2116) | — |
| O-14 | « transaction, price movement, and participant interaction transparency provided by AMMs, may potentially obviate the need for certain regulations » | p.12 l.463-465 | 18 |
| O-15 | « participants and third parties to audit and report vulnerabilities » — contexte déclaré dans la lettre (« a passage about smart-contract code ») : condition A (p.18 l.693-700) ; toute extension aux transactions est une lecture de Bell, jamais celle de la Commission | p.19 l.728-729 | 9 |
| O-16 | « public deployment of TSV smart contracts » (paraphrase de « auditable, public, and deployed on a public, permissionless distributed ledger ») | p.18 l.694-695 ; p.19 l.727 | paraphrase |
| O-17 | « could dislocate from the prices of the NMS stock in traditional format » | p.28 l.1073-1074 | 12 |
| O-18 | « to help limit the potential impact of any price dislocations » (limites de volume) | p.28 l.1076-1077 | 10 |
| O-19 | « due to a miscalculation in either a numerator or denominator » | p.26 l.1012-1013 | 10 |
| O-20 | Q3 : « potentially impact the liquidity, pricing, or trading of underlying NMS stock » ; effets du reporting sous dix minutes et de l'« overnight trading » sur la qualité de marché | p.57 l.2039-2040 ; l.2042-2044 (Q3 entière : p.57-58 l.2039-2048) | 11 ; 2 |
| O-21 | Q6 : pertinence des limites Tier 1/Tier 2 (paraphrase) | p.58 l.2057-2064 | paraphrase |
| O-22 | « Both concern quantities that Bell measures » — formule imposée | ADR-B0 l.133 (« Q3 et Q6 portent sur des grandeurs que Bell mesure ») [lu] | — |

**Non cité, volontairement** : p.36 l.1373-1376 et p.47 l.1691-1692 (« has not passed upon the merits or accuracy… ») — le mot « accuracy » rougit au gate vocabulaire (scopes `site`/`harness`) ; aucune citation portant guarantee/verified/accuracy/confidence n'est reprise, même dans la bouche de la Commission.

### §2 — ce que Bell mesure
| # | Affirmation | Source | Niveau |
|---|---|---|---|
| P-1 | 4 tokens TSLAx, AAPLx, NVDAx, SPYx, pools AMM publics sur Solana | ROADMAP-BELL l.6 (Palier 0) ; ADR-T1aii D1-ter l.84-95 (registre fondateur = pools 2025 découverts on-chain) ; ADR-T1aii l.7 (pools Raydium CLMM) ; CENSUS v4 l.59 | [lu] ; **condition** : univers au jour du dépôt (Palier 1 peut l'élargir ⇒ mettre à jour P-1 et §4) |
| P-2 | « not traded on a TSV » | définition TSV = pools AMM « for permissioned participants » (ordre p.1 l.22-25) vs pools DEX publics (ADR-T1aii l.7) ; « aucun TSV agréé n'opère à ce jour » (CENSUS v4 l.62 ; calendrier « mid to late October » cité par ADR-B0 l.11 depuis R3 [lu][P2]) | [lu] (définition) + [2nd] (calendrier) ; **condition** : aucune de ces pools n'appartient à un TSV au jour du dépôt (registre des Notices, PR-GTM-6) |
| P-3 | exclusion « provides synthetic exposure to an underlying security » ; aucune représentation que ce soient des Tokenized NMS Stock | ordre p.2 l.28-31 (citation l.30, 7 mots) [lu] ; CENSUS v4 l.11 (xStocks = « tracker certificate », « formulation proche de l'exclusion SEC ») [lu-WF, NON repris dans la lettre] | [lu] |
| P-4 | « The method transfers to TSV pools; the population does not. » | [analyse] (avis advisor, conseil) ; GTM-BELL l.115 (bascule TSV) | [analyse] |
| Q3-1 | g = ln(P_session / P_close) par session déclarée | ADR-B0 D2 (i) l.28 ; `apps/bell/src/gap.ts` (sha `9dd168af…`) | [lu] |
| Q3-2 | P_session = VWAP par action sous-jacente (division par le multiplicateur on-chain, par fill) | ADR-T1aii C-7 l.184-188 ; `gap.ts` l.89-104 (`sessionGapRebase`) | [lu] |
| Q3-3 | régimes {weekday overnight, weekend, holiday} (pre/after publiés à part, non comparés — phrase retirée de la lettre pour la longueur) | ADR-T1aii P2 l.41 | [lu] |
| Q3-4 | P_close = dernier close consolidé (licence ; jamais republié) | ADR-B0 D2 (i) l.28 ; ESC-1 (c) l.128 ; ADR-T1aii D1-quinquies l.300-311 ; **aucun fournisseur nommé** (décision 69, CHANTIERS l.208/223) | [lu] |
| Q3-5 | statistique de Cong et al. Table 4 : part des observations dont l'écart au dernier close dépasse 1/2/5 % | `ssrn-5937314-tokenized-stocks.txt` l.1320-1328, Table 4 **p. imprimée 32 = page PDF 33** [lu+img] ; seuils Bell 1/2/5 : ADR-T1aii C-8 l.34 ; `gap.ts` l.74-77 `exceeds` = abs(exp(g) − 1) > pct/100 (écart RELATIF, comme Cong) | [lu+img] |
| Q3-6 | valeurs Cong : xStock weekday 71 % / 57 % / 12 % ; weekend 15 % / 8 % / 0 % (« of hours ») | Table 4, page PDF 33 : texte l.1330-1336 (mise en page brouillée par pdftotext) **confirmé par rendu-image** `scratchpad/cong-p33-33.png` (pdftoppm, 110 dpi) ; concordant avec L6 l.8-12 (lecteur distinct) | [lu+img] |
| Q3-7 | légende Cong : « share of observed hours », Sep-Oct 2025, weekday = « overnight hours Monday-Thursday », weekend = « Friday 4pm through Monday 9:30am » | Table 4 caption, txt l.1326-1328 | [lu+img] |
| Q3-8 | auteurs, titre, date : Lin William Cong, Wayne Landsman, Daniel Rabetti, Che Zhang, Wenqi Zhao, « Tokenized Stocks », December 2025 | txt l.1-6 ; **id SSRN 5937314 = nom de fichier + L6 l.1, ABSENT du texte du papier** ⇒ `<REF:cong_ssrn>` | [lu] + REF |
| Q3-9 | « Units, closing-price sources, samples and session definitions differ; the comparison is descriptive » | ADR-T1aii D2 l.19 (« leurs heures ≠ nos sessions, leur top-100 ≠ nos 4 pools ») ; ADR-B0 D7 l.60 (« écart à Cong = constat publié, jamais vert/rouge ») ; source de close de Cong = celle de sa légende (txt l.1327) vs close consolidé sous licence pour Bell (Q3-4) | [lu] |
| Q3-10 | « an input to, not a measure of, any effect … ; it implies no causal link » | ADR-T1aii D2 l.19 ; ROADMAP l.14 (« aucune phrase causale »), l.23 ; Cong Table 10 (lien token → ouverture) NON rejouée par Bell (L6 l.16) | [lu] |
| Q6-1 | pour chaque session : ratio volume des pools / ADV consolidé du mois précédent ; numérateur recalculé des swaps on-chain, dédupliqué par signature, converti en actions via le multiplicateur ; ratio seul publié | `apps/bell/src/volume.ts` (sha `d521dd87…`) l.1-10, l.34-48 ; ADR-B0 D2 (iii) l.30 ; ADR-T1aii C-6 l.32 | [lu] |
| Q6-2 | **[COND I-5]** agrégat mensuel selon l'arithmétique de la condition F | ordre p.24 l.902-906 [lu] ; **grandeur NON servie aujourd'hui** (`vol_ratio` = session) ⇒ item I-5 (définition, période du numérateur non explicitée par l'ordre, convention de date de négociation note 69 p.25 l.959-965, test) | [lu] + item |
| Q6-3 | limites 0,25 % (Tier 1) et 2,5 % (Tier 2) | ordre p.24 l.896-902 ; **appartenance des sous-jacents à un tier NON affirmée** (LULD Plan Appendix A non lu ; p.25 l.946-949 définit Tier 1) | [lu] |
| Q6-4 | « the ratio describes current on-chain activity, not whether any venue is within a limit » | `volume.ts` l.8 (« The claim is never "the TSV is under the cap" ») ; ADR-B0 D2 (iii) l.30 | [lu] |

### §3 — la méthode (décision 138)
| # | Affirmation | Source | Niveau / condition au dépôt |
|---|---|---|---|
| M-0 | « The method, more than any single figure, is what we offer » | CHANTIERS l.915 (décision 138 verbatim « on souligne notre methode ») | [lu] |
| M-1 | recalculable bit à bit depuis les données publiques du registre **avec le code de rejeu publié**, à close/volume consolidé identiques obtenus sous la licence du lecteur ; Bell ne les republie jamais | ADR-B0 D8 l.74 (DoD), ESC-1 (c) l.128, D5 l.50 (rejeu bit-identique) ; tests `bell_session_gap_identical_to_replay` (ADR-B0 l.42), `bell_course_reduced_series_replays_vwap_and_chain` (ADR-T1aii C-5 l.31) ; arithmétique flottante (`gap.ts` l.103-104, `volume.ts` l.45-48) ⇒ le bit-identique vaut pour le rejeu avec le code Bell, d'où la précision | [lu] ; **condition** : code de rejeu public (lien depuis `url_method`) |
| M-2 | ledgers de collecte et timeline chaînés par hash ; édition ultérieure détectable par recalcul une fois la tête publiée/ancrée | ADR-B0 D2 l.24 (`prev_line_hash`, append-only, signé) ; ADR-T1aii D1-octies l.388-394 (`payload_sha256` ; le vérificateur RECALCULE ; limite : un re-hachage complet avant publication de `ledger_sha256` n'est pas défait ⇒ ancrage) | [lu] |
| M-3 | chaque ligne de la timeline signée Ed25519, clé publique publiée ; la signature montre l'origine, pas la vérité (limite portée en §3, retirée de §4 pour la longueur) | ADR-B0 D8 l.69 (« la signature atteste l'origine … jamais la vérité des faits ») | [lu] ; **condition** : T-1b backend servi |
| M-4 | manifestes des frontières de course (début, fin, chaque reprise) horodatés OpenTimestamps puis rattachés à un bloc Bitcoin | ANCHORS l.15-31 (frontières `probe_end`/`mint_start`/`mint_resume`/`mint_end`/`final`), l.58-63 (stamp ⇒ preuve pendante ; upgrade ⇒ preuve Bitcoin ; aucun délai chiffré), l.37-51 (lignes TSLAx/AAPLx/NVDAx) | [lu] ; **condition** : `<BELL:anchored_runs>` (item I-7) + preuves mises à niveau |
| M-5 | limite de l'ancre : existence de la tête avant le bloc ; ni provenance des pages ni exécution du scan | ANCHORS l.12-13 (verbatim décision 124(3)), l.71 | [lu] |
| M-6 | hôte séparé qui n'exécute que Bell et une sonde de surveillance externe | CHANTIERS l.120 (décision 57), l.123 (VPS provisionné ; clé SSH de déploiement = celle du VPS site) | [lu] ; **condition** : état de l'hôte au dépôt |
| M-7 | « operated and deployed by the MONARK orchestrator … the signing key never leaves » | ADR-B0 ESC-2 l.129 (formule décidée pour `/bell/method`) | [lu] ; formulation = acte investisseur AI-7 |
| M-8 | indépendance revendiquée vis-à-vis des venues/émetteurs mesurés, pas de MONARK | ADR-B0 D8 l.68 ; ESC-2 l.129 ; [analyse] (même opérateur que le site) ; relation commerciale : GTM l.56, l.60 (« aucun … démarché à ce jour », 2026-09-19) ⇒ `<INVESTISSEUR:relation_commerciale>` | [lu] + acte investisseur |
| M-9 | abstention nommée au lieu d'une estimation : `no_close_ref`, `rebase_unverified`, `no_quorum` ; comptées et publiées (`<BELL:residual_counts>`) | `apps/bell/src/residuals.ts` (sha `d7b43f53…`) l.15-42 (enum fermé), l.25, l.30, l.32 ; ADR-B0 D8 l.78 ; V-7 l.142 ; ADR-T1aii C-9 l.35 (`bell_abstentions_counted`) ; `gap.ts` l.53, l.66 (`no_fill_in_window`) | [lu] |
| M-10 | « no rating and no probability for any event » | ADR-B0 D1 l.21 (interdits : score/probabilité par événement) | [lu] |
| M-11 | [OPTION] `under_calib` | ADR-B0 D3 l.37 (concept de **T-3**) ; **0 occurrence** dans `apps/bell/src` | [lu] ; item I-6 |
| M-12 | lectures sur deux opérateurs distincts là où la même méthode existe chez les deux ; énumération mono-opérateur déclarée (`authority_scan_mono_operator`) | ADR-T1aii D1 l.16 (quorum ≥ 2 fournisseurs distincts), C-1 l.27, D1-quater l.235-240, l.269-271 ; `residuals.ts` l.34 ; `getTransactionsForAddress` Helius-exclusif (ADR-T1aii l.8 ; nom du fournisseur NON repris dans la lettre) | [lu] |
| M-13 | les événements trouvés et l'état final du mint sont relus sur deux opérateurs | ADR-T1aii l.226-229 (« relire chaque candidat quorum-2 … clé = événement décodé »), l.230-234 (oracle d'état final C-3 bit-à-bit, `ScaledUiAmountConfig` lu quorum-2 au slot épinglé) ; D1-sexies l.328 (ancrage C-3 dans `buildSolanaSymbol`) | [lu] |
| M-14 | re-dérivation par une seconde méthode exhaustive **sur le même opérateur** (toutes les transactions du token) | course go-1 de recoupement : G0-b3d-b l.25, l.249 (`equal` 4/4 ∧ H1 ∧ H3) ; CHANTIERS l.838 (TSLAx `equal`), l.898 (AAPLx `equal`, 2 629 pages) ; ledger de cycle de l'opérateur de la course (INCIDENT l.9, l.37) ⇒ `<BELL:crosscheck_verdicts>` | [lu] ; **condition** : course complète 4/4 |
| M-15 | page courte gardée seulement si la requête de continuation revient vide ET si une requête indépendante de la dernière transaction jusqu'à un slot épinglé rend la dernière entrée de la page ; sinon arrêt | CHANTIERS l.882 (règle BELL-SHORTPAGE-1) ; `docs/G2-lot-bell-shortpage-1.md` l.21-27 (ancre C-8 demandée seulement si sonde vide ; commit seulement si ancre égale ; sinon `not_full_pages`), l.55-60 (requête C-8 : desc, `limit 1`, `slot.lte = oracle_slot`) | [lu] ; **condition** : BELL-SHORTPAGE-1 fusionné (G7) et appliqué aux courses sources |
| M-16 | reprise depuis la dernière entrée durable ; chaque reprise ancrée | INCIDENT-powercut l.15-28 (préfixe durable valide, reprise, ancre `mint_resume`) ; ANCHORS l.42-49 | [lu] |
| M-17 | un registre tiers complète le reporting de la venue (condition G) : indépendant de la venue ; recalculé depuis le registre public exigé par la condition A ; déclare ce qu'il ne calcule pas | ordre p.28 l.1085-1088 (G), p.18 l.694-695 (A) ; objection « auto-publication » : ADR-B0 l.134, GTM l.123/126 ; **aucun auteur de lettre nommé** (F-3) | [lu] |
| M-18 | [OPTION] « We intend to apply the same method to TSV pools once they operate » | GTM-BELL l.115 (§5(d) bascule de la source primaire) — énoncé prospectif ⇒ go investisseur | [lu] + acte investisseur |

### §4 — limites déclarées
| # | Limite | Source | Niveau |
|---|---|---|---|
| L-1 | omission d'une transaction à l'intérieur d'une page complète non détectable ; les règles protègent les extrémités ; quorum + re-dérivation réduisent sans supprimer ; certaines énumérations reposent sur un seul opérateur | énoncée par la mission (« omission intra-page ») ; M-12, M-14, M-15 ; ANCHORS l.12-13 | [analyse] sur [lu] |
| L-2 | échantillon : 4 symboles, une famille, une chaîne, hors cadre TSV, pools identifiées on-chain, fenêtres déclarées ; pas de généralisation | P-1, P-2 ; ADR-T1aii D2 l.19 (population TSV ≠ population xStocks) | [lu] |
| L-3 | ni TSV ni Covered Firm ; aucune évaluation de conformité ; pas une certification | GTM l.138 (statut juridique, résidu `mislabeled_attestation`), l.18 ; ROADMAP l.30 ; définitions ordre p.1 l.15-25 (TSV), p.4 l.143-148 (Covered Firm) | [lu] |
| — | (licence du close, signature/ancre) : portées en §3 (M-1, M-3, M-5), retirées de §4 pour tenir en 3 pages | — | — |

### §5 — disponibilité
| # | Élément | Source | Condition |
|---|---|---|---|
| A-1 | `state.json`, `timeline.jsonl` sur `bell.monarkgate.tech` | ADR-B0 D2 l.24 | servis à T-1b ; DNS « action sortante au go T-1b » (CHANTIERS l.123 ; décision 73 l.212) |
| A-2 | page de méthode (bornes de session, formules, liste des résidus) **liant** clé publique, ancres et code de rejeu | ADR-B0 D8 l.69 (`/bell/method`, `/bell/pubkey`) ; ANCHORS l.55-56, l.65-71 (vérification par un tiers) ; CHANTIERS l.59 (`apps/bell` non exporté avant T-1b) | page servie + liens effectifs + code exporté au dépôt, sinon retirer/scoper M-1 |
| — | offre « underlying records to Commission staff » | retirée du texte (longueur) ; ajout possible = acte investisseur AI-8 | — |

## B. Ce que la lettre ne dit pas, volontairement (et pourquoi)
- **Aucune lettre du dossier citée** : `docs/biblio/bell/_txt/sec-4927-comment-*` = pages d'erreur WAF sec.gov (1 925 o, « Request Rate Threshold Exceeded », R-gtm l.116) ; le seul contenu en dépôt est un extrait [lu-WF] (R-gtm l.93-101) ⇒ rien n'est [lu] première main ⇒ l'objection « auto-publication par le TSV » est traitée sans auteur (M-17).
- **Aucun fournisseur de données nommé** (ni close, ni RPC) : décision 69 (CHANTIERS l.208, l.223) lue de façon conservatrice ; les exemples de résidus évitent `cash_cross_*`.
- **Aucun halt** : ni mesure, ni question (ADR-B0 l.133) ; la condition H n'apparaît que comme texte de l'ordre (O-8).
- **Aucun chiffre de marché** (capitalisation, volumes en dollars, parts) : seules les valeurs publiées de la Table 4 de Cong (citées) et des placeholders Bell.
- **Aucune affirmation de nouveauté** (« first », « only » au sens exclusif) : 11 des 14 lettres du dossier non lues (NOTE-DEPOT C-8) ; les 7 « only » du texte sont restrictifs (contrôlé : `check-table.mjs`).
- **Pas de « gap/vide » attribué à la Commission** : la décision 138 est appliquée par les citations (§1) ; le lecteur conclut.

## C. Placeholders — 26 dans la lettre (+ 3 exigences de liens portées par `url_method`)
| Placeholder | Grandeur | Fichier attendu | Lot producteur | Condition avant remplissage |
|---|---|---|---|---|
| `<INVESTISSEUR:date_de_depot>` | date de la lettre = date du dépôt | — | acte investisseur | go de dépôt |
| `<REF:cong_ssrn>` | id/URL SSRN de Cong et al. | lecture sur place (orchestrateur) | — | l'id 5937314 vient du nom de fichier + L6 l.1 ; absent du texte du papier (item I-8) |
| `<BELL:t4_TSLAx_wkn_gt1>` / `_gt2` / `_gt5` | part des sessions « weekday overnight » TSLAx où abs(exp(g) − 1) > 1 / 2 / 5 % | `docs/MESURE-FONDATRICE-bell-2026-09.md` (via `bell-report.mjs --founding`, ADR-T1aii l.71, l.101, item #11 l.362) | **-b1-bis-ii** (course fondatrice rebase-aware ; ROADMAP l.6 : … → -b3d-b2 → R1 → -b1-bis-ii → …) | -b3d-b2 publié seulement si `equal` 4/4 ∧ H1 ∧ H3 (G0-b3d-b l.249) ; item #11 livré ; série réduite rejouée bit-identique (C-5) ; course ancrée (I-7) |
| `<BELL:t4_TSLAx_we_gt1>` / `_gt2` / `_gt5` | idem, régime weekend | idem | idem | idem |
| `<BELL:window_TSLAx>` | fenêtre effective TSLAx `[fromUtc, toUtc]` (cible 2025-07-01 → 2025-10-31 ; pools nés après = depuis le premier fill, borne déclarée par pool) | MESURE-FONDATRICE + provenance de course (ADR-T1aii D1-bis l.61, C-11 l.37) | -b1-bis-ii | bornes épinglées en provenance |
| `<BELL:n_TSLAx_wkn>`, `<BELL:n_TSLAx_we>` | nombre de sessions par régime (dénominateur de la part) | MESURE-FONDATRICE | -b1-bis-ii | n publié par régime (C-11 l.37) |
| `<BELL:url_report>` | URL du rapport public (autres symboles + régime holiday) | surface T-1b | T-1b | servi + test d'intégration (Branchement) |
| `<BELL:window_q6>` | fenêtre de l'agrégat Q6 | `state.json` + I-5 | T-1b (ou -b1-bis-ii si la course porte le fait iii) | fenêtre déclarée ; **[COND I-5]** |
| `<BELL:volm_TSLAx>` / `_AAPLx` / `_NVDAx` / `_SPYx` | agrégat MENSUEL comparable à F (moyenne des volumes journaliers des pools en actions / ADV consolidé du mois précédent) | `state.json` + agrégation `bell-report` à créer | **item I-5** | agrégat défini, épinglé, testé ; `multiplier_unit` compté ; **[COND I-5]** |
| `<BELL:anchored_runs>` | liste des courses ancrées (frontières + commit + `ots_ref`) | `docs/course-bell/ANCHORS.md` | orchestrateur | preuves OTS mises à niveau ; course fondatrice ancrée ou phrase scopée (I-7) |
| `<BELL:crosscheck_verdicts>` | verdicts du recoupement exhaustif par mint (ex. `equal`, N transactions, pages) | `crosscheck-report.json` + `crosscheck-<MINT>.json` (`ledger_sha256`) | course go-1 + **-b3d-b2** (attestation `source:"fullmint"`) | 4/4 complets ; ancre `final` |
| `<BELL:residual_counts>` | compteurs de résidus/abstentions sur les fenêtres citées | `state.json` (`bell_abstentions_counted`) | -b1-bis-ii / T-1b | compteurs publiés |
| `<BELL:url_state>`, `<BELL:url_timeline>` | URLs servies | T-1b backend | T-1b | DNS + service + test |
| `<BELL:url_method>` | URL de la page de méthode ; **doit lier** `url_pubkey`, `url_anchors` (manifestes + `.ots`), `url_replay` (dépôt public + commande) | T-1b-site (hors gates — décision 101) | T-1b-site | validation visuelle investisseur (décision 73) ; liens effectifs ; `apps/bell` exporté |
| `<INVESTISSEUR:relation_commerciale>` | déclaration d'absence de relation commerciale avec émetteurs/venues mesurés | — | acte investisseur | à la date du dépôt |
| `<INVESTISSEUR:contact>` | contact public | — | acte investisseur | PII publique permanente (ordre p.60 l.2098-2100) |
| `<INVESTISSEUR:signataire>` | nom, titre, organisation (champ public « Commenter Name ») | — | acte investisseur | « MONARK » avant incorporation : LEGAL-ATLAS (ROADMAP l.18) |

**Nota** : aucun placeholder ne porte l'ADV ni le close (ESC-1 c ; ADR-T1aii C-6) ; tout ratio publié l'est à la précision de `GAP_PRECISION` (`volume.ts` l.43, `toFixed` l.48) ou arrondi DÉCLARÉ au remplissage.

## D. Correspondance page → section de l'ordre (pour remplacer les « ll. » au texte final, NOTE-DEPOT C-13)
| Citation (lettre) | Page | Section / item |
|---|---|---|
| exclusion « synthetic exposure » | p.2 | Section I (Introduction), définition de « Tokenized NMS Stock » |
| transparence des AMM | p.12 | Section I.B (Exemption from the Definition of "Exchange" and Scope) |
| « evaluate the impact … » | p.14 | Section I.B |
| « would not be subject to the same books and records … » | p.17 | Section II (Conditions of the TSV Exemption), introduction |
| condition A (déploiement public) ; « participants and third parties … » | p.18-19 | Section II.A (TSV Distributed Ledger Applications) |
| condition E « must verify » | p.23 | Section II.E |
| condition F (limites, arithmétique, « miscalculation », « dislocate », « help limit ») | p.24, 26, 28 | Section II.F |
| condition G | p.28-29 | Section II.G (Transaction Transparency) |
| condition H | p.30 | Section II.H (Stoppage of Trading) |
| condition J | p.32 | Section II.J (No Leverage) |
| « at any time » | p.35 | Section II.L (Books and Records) |
| item i | p.39 | Section III, item i (Tokenization) |
| item x | p.44 | Section III, item x (Systems Safeguards) |
| « monitor closely », « all aspects », Q3, Q6 | p.57-58 | Section VI (Solicitation of Comments), Questions 3 et 6 |
| adresse, canaux de dépôt | p.59-60 | Section VI (Electronic / Paper Comments) |
