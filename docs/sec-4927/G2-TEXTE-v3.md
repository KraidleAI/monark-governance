Modèle résolu : claude-opus-5-5[1m]

# G2 TEXTE — lettre SEC File No. 4-927, version v3 (relecture en contexte frais, instance séparée)

**Verdict : PASS-AVEC-CORRECTIONS**, avec 1 correction bloquante (C-G2-1) et 7 non bloquantes (C-G2-2 à C-G2-8). Il y a aussi 20 observations
avec leur disposition et 5 items formés (I-G2-1 à I-G2-5). Aucun FAIL n'est soutenu : les 13 citations de l'ordre sont exactes au mot près
et à la bonne page, l'option B est tenue, le bouclier causal et II.L sont conservés, il n'y a aucun « will », et la forme est conforme (3 pages à
12 pt, mesure reproduite).

## 0. Provenance et périmètre
- Relecteur : `claude-opus-5-5[1m]` (préfixe R-1 `claude-opus-5-5`), effort max. Instance séparée du rédacteur, en contexte frais, sans accès
  au transcript du worker.
- Objet : `F:\Monark\docs\sec-4927\LETTRE-4-927-v3.md`, sha256 `850e743ed3b25ba7a90f094c84b805ff72f6787743b117b68bef300a30d93716`
  (recalculé ; égal à la valeur de la mission). RENDU : `RENDU-v3.md`, sha256 `ebfa8fa796f10e595e586895d5f76e0264d03efd4e27350200468eb12df2a822`.
- Dépôt : `F:\Monark`, branche `lot/etude-suite`, à `dd9cd48` au départ. Le HEAD a avancé pendant la revue jusqu'à `0383e5b` (3 commits de
  l'orchestrateur : CHANTIERS +5 lignes ajoutées après la l.1020, CHECKPOINT2-ukemi-conc-1, ETAT-REPRISE, SIDECAR). Ces commits ne touchent
  aucun objet revu : les sha de la lettre, du RENDU, de `collect.ts`, `volume.ts`, `sessions.ts`, `residuals.ts` et ANCHORS sont identiques,
  et les lignes citées de CHANTIERS (55, 59, 119, 120, 123, 215, 838, 898, 964, 992, 1016, 1019) ont un hash ligne à ligne identique à
  `dd9cd48`. La revue vaut donc pour les deux HEAD.
  - Le HEAD a ensuite avancé à `d55fbb7` : `fdf1589` (07:14:29Z, « 3 remaining Bell anchor proofs upgraded … 15/15 ») puis `d55fbb7` (horodatage
    de l'entrée CHANTIERS). La lettre et le RENDU sont inchangés (sha identiques) et les lignes citées aussi ; **le fait OTS, lui, a changé**
    (voir 1-22 et C-G2-8).
  - Un fichier non suivi, `docs/biblio/ukemi-modeL/L-lecture-angelopoulos-bates-2021-gentle-intro.md` (créé à 07:15:16Z), vient d'un autre
    agent : aucun outil de cette revue n'écrit hors de `F:\tmp\g2-sec-v3\`.
- Mode : docs-only. Aucune écriture dans `F:\Monark` ni dans `F:\Monark-wt-bellexec` (`git status --short` vide avant et après chaque
  exécution, preuve dans `probe-q6.out`). Aucun appel réseau, aucun commit, aucun workflow (R-20). Temporaires : `F:\tmp\g2-sec-v3\` seulement.
  Le `--out` vivant de SPYx (`F:\course-bell\bell-b3d-run`) n'a pas été ouvert.
- Niveaux : tout ce qui suit est **[lu]** de première main dans cette session, au `fichier:ligne` indiqué. Deux bases sont externes :
  - **close « consolidated »** (l.26) : la note de lecture du dépôt `docs/biblio/bell/L-lecture-databento-api-2026-09-20.md` (sha
    `eda5b915…7ebd`, l.29) cite databento.com : « Official consolidated end-of-day summary data for all US equities is published by the Nasdaq
    NLS+ feed ». Niveau [lu] pour le lecteur Sonnet 5, sur extraits indexés (méthode déclarée l.5) ; relu par moi dans la note, pas sur la page
    primaire (pas de réseau).
  - **ADV « consolidated »** (l.45) : la seule base est `volume.ts` l.4-5, que le code qualifie lui-même de **[2nd]** (« Polygon
    redistributes the consolidated tape »). Aucune lecture de première main n'existe dans le dépôt ⇒ O-20 et procurement I-G2-5.

## 1. Exactitude factuelle, phrase par phrase (lettre v3, numéros de ligne du fichier)

| # | l. | Affirmation (extrait) | Preuve rejouée | Statut |
|---|---|---|---|---|
| 1-1 | 12 | « keeps a public, signed record … designed so that anyone can recompute it » | signature = fait T-1b (`collect.ts` l.81-82) ; clé non générée (CHANTIERS:123) ; « anyone can recompute » figure dans la clause « sinon » de `url_method` (l.79) | CONDITIONNÉ. « signed » n'est porté par aucun placeholder ⇒ C-G2-2 |
| 1-2 | 12 | « suggest four properties … Bell applies them to its own records » | option B (CHANTIERS:992, :1019) ; RENDU §6, dernière ligne | CONFORME, conditionné T-1b/T-1b-site |
| 1-3 | 16 | « Several conditions rest on what each TSV reports about itself » | ordre p.24 l.902-908 (le TSV calcule) ; p.28 l.1085-1088 (le TSV publie) | CONFORME (caractérisation par la lettre, non attribuée à la Commission) |
| 1-4 | 16-18 | II, II.L, II.F, I.B, III item x | §2 ci-dessous | CONFORME (voir O-5) |
| 1-5 | 20 | paraphrases de Q3 et Q6 | ordre p.57-58 l.2039-2048 ; p.58 l.2057-2064 | ÉCART DE FIDÉLITÉ : « if any » omis ⇒ C-G2-4 |
| 1-6 | 24 | quatre tokens, « public AMM pools on Solana, not on a TSV » | TSV = pools « for permissioned participants » (ordre p.1 l.22-25) ; SOURCES P-1/P-2 (conditions au jour du dépôt) | CONFORME, sous les conditions P-1/P-2 |
| 1-7 | 24 | « The method, not this population, is designed to apply to TSV pools » | formulation recommandée par l'AVIS (l.43) ; pas de « will » | CONFORME (énoncé de conception, pas un engagement) |
| 1-8 | 26 | g = ln(P_session/P_close), VWAP par action sous-jacente, dernier close consolidé | `collect.ts` l.118-125 (groupes par session), l.140/151 (close par jour de référence), l.161-177 (multiplicateur par fill) ; `sessions.ts` l.139-147 ; `close.ts` l.14 et note Databento l.29 (§0) | CONFORME (voir O-9) |
| 1-9 | 26-35 | Cong et al. : auteurs, décembre 2025, p.32, statistique, 71/12/15/0, septembre-octobre 2025, seuil de 2 % | texte Cong l.1-6, l.1320-1336 ; pied de page « 32 » à la l.1363 (Table 4 = page imprimée 32, page PDF 33) | CONFORME |
| 1-10 | 41 | « Units, closing-price sources, samples and session definitions differ » | légende Cong (dernier close Yahoo, heures) contre Bell (sessions, close consolidé) | CONFORME |
| 1-11 | 43 | bouclier causal | identique à v2 l.48 (`sent-diff.mjs` : phrase inchangée) | CONFORME (C-G2-6 = syntaxe seule, optionnelle) |
| 1-12 | 45 | ratio par fenêtre, dédoublonné, converti avec le multiplicateur, ADV sur une période énoncée par la méthode | `collect.ts` l.189-201, l.266-267 ; dédoublonnage l.337-342 ; `volume.ts` l.42-48 ; ADV sur 45 jours glissants l.383-392 | CONFORME sur le chemin nominal. FAUX si le mint est illisible (multiplicateur « 1 » par défaut, sonde cas A et D) ⇒ I-G2-1. Voir O-8 (numérateur = total de la fenêtre) et O-20 (« consolidated » de l'ADV sur base [2nd]) |
| 1-13 | 45 | « These pools are not TSVs; … not whether any venue is within a limit » | `volume.ts` l.8-9 | CONFORME |
| 1-14 | 49-54 | 4 propriétés proposées | chapeau « could expect » ; (a) ordre II.G (i) p.28 l.1088 et (ii)-(v) p.29 l.1097-1099, note 78 p.28 l.1090-1094, II.A p.18 l.694 ; (d) note 81 p.29 l.1129-1131, p.26 l.1012-1013 ; II.F n'impose pas de publier le ratio (p.24-27 relues) | CONFORME : proposition, pas une lecture de l'ordre (voir O-4) |
| 1-15 | 58 | trois mints, énumération Helius, relecture sur un second endpoint | sha des 3 `crosscheck-*.json` = lignes des manifestes `mint_end-*` = colonne ANCHORS ; `rebase-crosscheck.ts` l.252-253, l.275, l.302-305 ; `crosscheck-report.json` : opérateurs `helius` et `solana-foundation` | CONFORME |
| 1-16 | 58 | « A defective page, including a multiplier-event mismatch, is not recorded and stops the run » | l.288, l.291, l.299, l.303-305 ⇒ retour anticipé l.308, page non committée | CONFORME (voir O-10) |
| 1-17 | 58 | « complete only if a separate query … returns the last one recorded » | l.330-345 (condition nécessaire, parmi d'autres) | CONFORME |
| 1-18 | 58 | « a second method gave the same history, event for event » | `comparator_verdict.verdict == "equal"` ×3 ; trajectoire consommée `scanMethod:"authority"` (`collect.ts` l.566-579) ; balayage complet du mint = contre-vérification (`rebase-crosscheck.ts` l.1-5) | CONFORME ; « second method » non défini ⇒ C-G2-7 |
| 1-19 | 58 | « never republished by Bell » ; « bit for bit with the published replay code » | garde anti-close `close.ts` l.2-4, `volume.ts` l.7-8 ; rejeu depuis une série de fills (ADR-T1aii C-5 l.31) ; corps illisibles sautés (`collect.ts` l.355-361) | CONDITIONNÉ `url_method` ; base du « bit for bit » incomplète ⇒ O-11 et I-G2-4 |
| 1-20 | 59 | « When an input is missing, Bell abstains with a named reason … and counts abstentions » | sonde cas B : ADV absent ⇒ `ratio_computed:false`, sans code ni compteur ; cas A : mint illisible ⇒ ratio publié sur « 1 » ; cas D : même mint illisible avec la porte réelle `rebaseForMint(undefined)` ⇒ l'écart s'abstient (`rebase_unverified`, compté) **pendant que** le ratio sort sur « 1 » ; `residuals.ts` l.24-45 n'a aucun code pour l'ADV absent | **FAUX tel qu'écrit ⇒ C-G2-1 (BLOQUANTE)** |
| 1-21 | 60 | journal chaîné ; manifeste soumis à OTS « at each start, end and resumption » | `rebase-crosscheck.ts` l.320-321 ; ANCHORS l.37-54 (15 horodatées ; une frontière re-horodatée 41 s plus tard, même manifeste) | CONFORME pour go-1 ; la généralité est traitée en O-12 |
| 1-22 | 60 | « 12 of 15 anchor proofs upgraded to Bitcoin attestations on 2026-09-23; the remaining 3 are published as they upgrade » | `git show 766402e --stat` (12 `.ots`, 05:39:18Z) ; `ots-heights.mjs` (12 avec tag Bitcoin, 3 sans ; hauteurs 968149-968205) ; condition « published » dans la clause « sinon » de `url_method` | CONFORME à la date de la v3 ; la condition est bien portée par le placeholder. **Dépassée depuis 07:14:29Z** : `fdf1589` donne 15/15, et `ots-heights.mjs` au HEAD `d55fbb7` trouve 15 fichiers avec tag Bitcoin (968225/968226 pour les 3 derniers) ⇒ C-G2-8 (I-v3-2) ; voir aussi O-13 |
| 1-23 | 60 | limite de l'ancre | ANCHORS l.12-13 (décision 124(3), verbatim) | CONFORME |
| 1-24 | 60 | timeline chaînée ligne à ligne, signée Ed25519, moitié publique publiée ; « origin, not truth » | `collect.ts` l.83-93 ; l.81-82 (signature = T-1b) ; ADR-B0 D8 l.69 | CONDITIONNÉ T-1b ⇒ C-G2-2 |
| 1-25 | 61 | écart indexé sur le jour de bourse du close « by a published rule » ; ratio publié avec sa fenêtre | `sessions.ts` l.145-147 ; `collect.ts` l.140, l.159, l.266-267 | CONFORME ; « published rule » conditionné par `url_method` |
| 1-26 | 63 | « published from a dedicated host operated by MONARK » | CHANTIERS:120 (décision 57) ; :123 (VPS KVM 2) | CONDITIONNÉ T-1b (voir O-14) |
| 1-27 | 63 | « the signing key never leaves it » | clé non générée ; **sauvegardes Hostinger hebdomadaires actives** sur ce VPS (CHANTIERS:123) ; formule ESC-2 (ADR-B0 l.129) | ABSOLU NON MESURÉ ⇒ C-G2-3 et I-G2-2 |
| 1-28 | 63-65 | indépendance vis-à-vis des venues et émetteurs, pas de MONARK | placeholder AI-5 | CONFORME (acte investisseur) |
| 1-29 | 69 | limite d'omission intra-page | `residuals.ts` l.34-36 ; `rebase-crosscheck.ts` l.252 (les deux méthodes passent par Helius) | CONFORME (« reduces … without removing ») |
| 1-30 | 70 | échantillon | SOURCES P-1 | CONFORME (voir O-15) |
| 1-31 | 71 | ni TSV ni Covered Firm ; pas de conformité évaluée ; pas une certification | SOURCES L-3 | CONFORME |

Résultat du point 1 :
- **Absence non mesurée** : une seule, la clé (1-27).
- **Affirmation contredite par le code** : une seule, l'abstention universelle (1-20).
- **Affirmation prospective** : aucune (0 « will », 0 « shall »). La démonstration Bell est bornée aux 3 mints terminés.
- **Propriétés** : conditionnelles par leur chapeau, sans engagement de Bell.
- **Phrase OTS dictée** : exacte à la livraison de la v3 (12/15, commit `766402e` de 05:39:18Z), et sa condition `url_method` est réellement
  écrite dans le placeholder (l.79 : « réécrire « the remaining 3 are published as they upgrade » »). Elle est **dépassée depuis 07:14:29Z**
  (15/15, `fdf1589`) ; lue comme un énoncé sur la journée du 2026-09-23, elle devient inexacte. Réécriture : C-G2-8, sous l'item I-v3-2.

## 2. Citations de l'ordre 34-106402
Texte pré-extrait `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt`, sha `adee69f6…4d08d` (recalculé). La page de
chaque ligne est comptée par sauts de page. Le localisateur du relecteur, `cite-check.mjs`, recherche **toutes** les occurrences, alors que le
worker ne gardait que la première ; il ajoute la section de l'ordre, et le contexte a été relu.

| # | Citation (mots) | Ordre | Contexte relu | Verdict |
|---|---|---|---|---|
| 1 | « intends to monitor closely the use of the exemptions » (9) | p.57 l.2028, sect. VI | « …and whether any modifications to the exemptions may be necessary » | fidèle |
| 2 | « in a machine-readable format » (4) | p.28 l.1086, II.G | obligation de mise à disposition publique des données de transaction | fidèle |
| 3 | « would not be subject to the same books and records, examinations, and other oversight requirements » (15) | p.17 l.672-673, II | sujet : « A TSV that meets the conditions… » | fidèle (« Such a TSV ») |
| 4 | « at any time » (3) | p.35 l.1337, II.L | consentement aux examens des books and records | fidèle |
| 5 | « due to a miscalculation in either a numerator or denominator » (10) | p.26 l.1012-1013, II.F | idem | fidèle (voir O-5) |
| 6 | « to help limit the potential impact of any price dislocations » (10) | p.28 l.1076-1077, II.F | sujet : « The trading volume limitations are designed… » | fidèle |
| 7 | « may potentially obviate the need for certain regulations » (8) | p.12 l.464-465, I.B | sujet : « certain features of distributed ledger technology, such as the … transparency provided by AMMs » | fidèle |
| 8 | « public auditability of the distributed ledger » (6) | p.44 l.1605-1606, III item x | exemple « e.g. » des types d'audit | fidèle |
| 9 | « potentially impact the liquidity, pricing, or trading of underlying NMS stock » (11) | p.57 l.2039-2040, Q3 | — | fidèle |
| 10 | « overnight trading » (2) | p.57 l.2043, Q3 | — | fidèle |
| 11 | « should be made to the TSV Exemption » (7) | p.58 l.2047-2048, Q3 | « What, **if any**, modifications should be made… » | citation exacte ; la paraphrase qui l'entoure omet « if any » ⇒ C-G2-4 |
| 12 | « provides synthetic exposure to an underlying security » (7) | p.2 l.30, I | exclusion de la définition « Tokenized NMS Stock » | fidèle |
| 13 | « as determined by the TSV » (5) | p.29 l.1129-1131, note 81 ; 2ᵉ occurrence l.1135, note 82, même page | note 81 = volume journalier « between the time of data publication … and the previous 24 hours » | fidèle, bonne note |

Constats sur les citations :
- **Localisation** : 13/13 au mot près, page citée = page réelle. Maximum 15 mots (≤ 25). Le span « Tokenized Stocks » est le titre de Cong,
  une non-citation attendue. `check-v2.mjs` (worker) donne le même résultat : 14 spans, 0 écart de page.
- **Libellés de section** : tous confirmés par le repérage des titres (II.G, II, II.L, II.F ×2, I.B, III item x, VI, I). Mon parseur affiche
  « I. Significant Operational Event » avant « L. » ; c'est un artefact, la lettre I d'une condition.
- **II.A** : référencé sans citation, et c'est exact. La lettre écrit « the public, permissionless ledger (Section II.A, p. 18) » sans
  guillemets. L'ordre p.18 l.694 porte « deployed on a public, permissionless distributed ledger ».
- **Q3** : la paraphrase de p.57-58 omet le « if any » de la Commission (C-G2-4). « asks … the effects of » est peu idiomatique ; la v2
  écrivait « what effects … could have ». **Q6** : « asks whether the Tier limits are appropriate and invites modifications » est fidèle à
  p.58 l.2057-2064 (« provide any potential modifications… »), voir O-2.
- **Attributions** : aucune attribution à la Commission de ce qu'elle n'a pas écrit, hors le « if any » ci-dessus. Le « vide » n'est pas
  attribué à la Commission (décision 138) : « Several conditions rest on… » est la phrase de la lettre.

## 3. Option B (décision 141, AVIS §4)
- La lettre ne revient jamais à « Bell le fait déjà mieux » : 0 comparatif (« better », « first », « unique », « only » exclusif ; `grep`),
  et Bell est cité comme démonstration « outside the TSV framework » (l.56).
- Les propriétés répondent aux « modifications » de Q3 et Q6 : chapeau l.49 « In answer to the requests for modifications in Questions 3 and 6 »,
  appuyé en §1 (l.20, « invites modifications »). Elles sont proposées pour le TSV, jamais pour Bell (D-v3-1, ruling (a)).
- Conservés : le bouclier causal (l.43 = v2 l.48, phrase inchangée selon `sent-diff.mjs`), II.L (l.16) et la phrase v2 l.60 (l.45,
  « These pools are not TSVs… », inchangée). NEAR/Ondo : 0 occurrence.
- Aucun engagement prospectif sur Bell (AI-6) : 0 « will ». O-13 signale un présent d'habitude dans la phrase dictée.

## 4. Vocabulaire
- **Gate du dépôt** : `node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v3.md` renvoie « gate:vocab OK — scanned 225 file(s) », exit 0.
  Le gate est non inerte sur ce chemin : 224 fichiers sans l'argument, 225 avec, donc la lettre est bien scannée (motifs GLOBAL seulement,
  `grep-forbidden.mjs` l.250-256).
- **Tous les scopes** (`check-vocab-v2.mjs`) : 0 partout sauf `harness` = 5 (seuils 1/5/2 %), soit le ruling 141, non rouvert.
- **Liste C-12 de NOTE-DEPOT** : 0 partner, autonomous, guarantee, verified, « verif » (tous suffixes), score, live, built, standard, first,
  interval, proven, probability, confidence, accuracy, price band, ±, reference price, endorse, approv. Occurrences restantes :
  - « attestations » ×1, uniquement dans la phrase dictée (ruling (c) du 06:38, non rouvert) ;
  - « independence » ×1, revendication de Bell vis-à-vis des venues et émetteurs, jamais attribuée à la SEC ;
  - « certif » ×1, en négation ;
  - « only » ×1, restrictif (« complete only if »).
- **Noms de fournisseurs** : seul « Helius » apparaît (D-v3-11, déclaré ; non rouvert). Ni le fournisseur de recoupement cash (décision 69),
  ni le fournisseur du close ne sont nommés.
- **Chiffres** : uniquement des références de l'ordre, les valeurs de la Table 4 de Cong ([lu], source primaire citée), les seuils, les dates,
  « 12 of 15 », SHA-256 et Ed25519. Aucune donnée de marché, aucun chiffre de seconde main.

## 5. Forme
- **Placeholders** : 14 `<<…>>`, un par ligne (14 lignes = 14 occurrences = 14 `>>`).
  - Chacun a une source et un déclencheur dans RENDU §5 (table relue ligne à ligne).
  - Le bandeau l.1 affirme que chacun les nomme dans la lettre même : c'est faux en ligne pour `<<DATE>>` et `<<SIGNATAIRE>>` (O-1).
  - 26 − 12 = 14 : `diff` des noms v2/v3 = exactement les 12 retirés annoncés.
- **Tableau** : GFM valide (1 tableau, 6 lignes, 5 barres non échappées par ligne ; `check-md-tables.mjs` : 0 ligne fautive ; lignes blanches
  avant et après).
- **Octets** : 0 CR ; LF final présent ; corps anglais 100 % ASCII hors placeholders (0 caractère non ASCII) ; guillemets droits équilibrés
  (28, soit 14 paires).
- **Pages** : rejeu des étapes de `measure.sh` (moteur de rendu `render-v3.mjs` inchangé ; seule la sortie est déplacée).
  - 12 pt / 1,15 : **3 pages** (492/424/435 mots rendus). Le RTF est identique à l'octet à `v3j-12pt.rtf` du worker ; le rendu-image de la
    p.3 montre environ 3 lignes libres.
  - 11 pt / 1,15 : 3 pages (541/614/197).
  - Calibration v2 à 12 pt : 4 pages, 330 mots en p.4 (= RENDU C-6).
  - **Marge réelle après la correction bloquante : environ 1 ligne.** Mesures par correction au §7.
- **Anglais, relu comme un juriste** :
  - ambiguïtés : « signature » désigne à la fois la transaction dédoublonnée (l.45) et la signature Ed25519 (l.60) ⇒ C-G2-5 ;
  - jargon non défini : « AMM » (jamais développé en v3) et « on-chain multiplier » (l.45, l.58) ⇒ C-G2-5 ; « second method » ⇒ C-G2-7 ;
  - parallélisme rompu au bouclier (« no effect on …, or of … ») ⇒ C-G2-6 ;
  - aucune phrase lisible à l'envers : « is not recorded and stops the run » est non ambigu ;
  - observations de style : O-2, O-5, O-6, O-9, O-14, O-15.

## 6. Cohérence RENDU ↔ lettre
- **Tableau v2→v3 (RENDU §2)** : il décrit le diff. Chaque phrase retirée ou ajoutée (`sent-diff.mjs` : 58 retirées ou réécrites, 40 ajoutées
  ou réécrites, 34 inchangées) se rattache à une ligne du tableau. Trois micro-éditions ne sont pas listées (O-18).
- **Placeholders** : les 12 retirés et les 14 restants s'additionnent à 26 (vérifié par diff des noms).
- **Items I-v3-1 à I-v3-6** : tous ont un propriétaire et un déclencheur (RENDU §8 relu). I-v3-5 est clos par le ruling (c).
- **Constats V3-1 à V3-9 rejoués** : tous concordent, avec un écart de numéro de ligne dans V3-3 (O-17).
- **C-7 (v2 et squelette intacts)** : sha recalculés, v2 `01de804a…be6d` et squelette `3f27e46b…c239c`.
- **RENDU §6 incomplet sur deux phrases** : la généralité « at each start, end and resumption of a run » et « used for per-share prices »
  dépendent de la course -b1-bis-ii (O-12).

## 7. Corrections — LISTE FERMÉE (texte exact à substituer)
Chaque substitution est prouvée par `F:\tmp\g2-sec-v3\apply-corrections.mjs` (sha `43137a4e…8e21`) : le script lève une erreur si
l'ancien texte n'est pas trouvé exactement une fois dans la lettre.

**Coût en pages mesuré (12 pt / 1,15), correction par correction :**
- C-G2-1 seule : 3 p.
- C-G2-1 avec, chacune séparément, C-G2-5, C-G2-6 ou C-G2-7 : 3 p.
- Variantes longues écartées, qui repassent à 4 p. (4 à 6 mots en p.4) : C-G2-3 « is generated and kept on it » ; C-G2-4 avec « if any »
  sans compensation, ou avec « whether » (même à 0 mot net, la phrase Q3 est à une limite de ligne).
- Jeu {1..7} sans C-G2-8 : 3 pages (495/430/452).
- **Jeu recommandé complet {1..8} : 3 pages** (495/430/444, environ 2 lignes libres au rendu-image de la p.3), 1 336 mots de corps. Sur la
  variante corrigée (`variants/final-set.md`, sha `c9fcca4b…09f1`), rejeu de `check-v2.mjs` (14 spans, 0 écart, 14 placeholders sur 14 lignes, tableau conforme),
  du gate (0 hit), de `check-vocab-v2.mjs` (inchangé), de `check-md-tables.mjs` (0) : 0 CR.

**C-G2-1 — BLOQUANTE — l.59 (démonstration « Named abstention »).**
- Remplacer `- *Named abstention.* When an input is missing, Bell abstains`
- par `- *Named abstention.* When a gap's closing price or multiplier cannot be established, Bell abstains`
- (le reste de la phrase est inchangé ; +5 mots).
- Motif : la phrase universelle est contredite par le chemin du ratio Q6.
  - ADV absent : `ratio_computed:false` publié, sans résiduel nommé ni compté (`collect.ts` l.198-199 ; `residuals.ts` l.24-45 n'a aucun code
    pour ce cas) ; sonde cas B.
  - Mint illisible : `vol_ratio` publié sur le multiplicateur par défaut « 1 » (l.192), `multiplier_unit:false`, aucune abstention du ratio ;
    sonde cas A. Le cas D montre l'asymétrie dans un même passage : avec la porte réelle `rebaseForMint(undefined)` et un close présent,
    l'écart s'abstient (`rebase_unverified`, compté) pendant que le ratio sort sur « 1 ». Le cas E (sans porte) calcule un gT.
- La phrase bornée est vraie par le code : pour les écarts, close absent ⇒ `no_close_ref` (l.151-156) ; multiplicateur non établi ⇒
  `rebase_unverified` (l.132-136, `supply.ts` l.186-196) ; désaccord de close ⇒ `cash_cross_mismatch` (l.144-150). Tous sont comptés (`bump`).
  Elle rejoint aussi mot pour mot la propriété (b) proposée aux TSV (« When a value cannot be established »).
- Élargissement possible après livraison de I-G2-1 (ruling de l'orchestrateur).
- `error_origin` proposé :
  - texte : **worker (squelette)**, reconduit en v2 et v3. SOURCES M-9 source l'abstention sur l'énumération de `residuals.ts` sans parcourir
    le chemin (iii).
  - défaut de code sous-jacent : **plan** (lot T-1a-ii). Le fait (iii) n'avait pas de spécification fail-closed ; le correctif C-G2-1 de ce
    lot n'a fermé que la jambe g_t (`rebaseForMint`).

**C-G2-2 — non bloquante — l.76-77 (placeholders `url_state` et `url_timeline`).**
- Les phrases au présent qui dépendent de T-1b n'ont aucune clause dans un placeholder (seul `url_method` en porte). Le bandeau promet
  pourtant un déclencheur par placeholder.
- (i) Dans `url_state`, remplacer `; déclencheur : T-1b backend servi (DNS compris)>>,` par :
  `; déclencheur : T-1b backend servi (DNS compris) ; phrases au présent qui en dépendent (RENDU-v3 §6) : « keeps a public, signed record », « Bell publishes g = », « Bell publishes the ratio », « counts abstentions in its published state file », « each ratio is published with its observation window », « Bell's records are published from a dedicated host » ; sinon pas de dépôt (NOTE-DEPOT C-1)>>,`
- (ii) Dans `url_timeline`, remplacer `preuve attendue : idem url_state ; déclencheur : T-1b backend servi>>.` par :
  `preuve attendue : idem url_state ; déclencheur : T-1b backend servi ; phrases au présent qui en dépendent : « signed with an Ed25519 key whose public half is published » et la phrase sur la clé de signature (§3, paragraphe de l'hôte) ; sinon pas de dépôt (NOTE-DEPOT C-1)>>.`
- Aucun effet sur le rendu : un placeholder par ligne, toujours 14.
- `error_origin` : worker v3.

**C-G2-3 — non bloquante pour la v3 ; condition bloquante au dépôt portée par I-G2-2 — l.63.**
- Remplacer `the signing key never leaves it.` par `the signing key is generated on it.` (+1 mot ; tient en 3 pages).
- Motif : absence absolue, non mesurée et non mesurable aujourd'hui (la clé n'existe pas, CHANTIERS:123). Le VPS Bell a des **sauvegardes
  fournisseur hebdomadaires actives** (CHANTIERS:123, « Sauvegardes Hostinger : hebdomadaires ») : si elles copient le disque, une copie de la
  clé quitte l'hôte. « is generated on it » est vrai par procédure (CHANTIERS:119, « générée sur le VPS par l'opérateur ») et muet sur les copies.
- La formule vient d'ESC-2 (ADR-B0 l.129, décision investisseur 14). Il faut donc un **ruling de l'orchestrateur et un acte de l'investisseur**.
  Alternative : garder « never leaves it » seulement si I-G2-2 établit, mesure à l'appui dans RUNBOOK-bell, qu'aucune sauvegarde ni aucun
  instantané fournisseur ne contient la clé.
- `error_origin` : **plan**. La formule ESC-2 date du 2026-09-19, avant le provisionnement du VPS avec sauvegardes (2026-09-20), et n'a pas été
  revérifiée depuis.

**C-G2-4 — non bloquante — l.20 (fidélité de la paraphrase de Q3).**
- Remplacer `and what modifications "should be made to the TSV Exemption"` par `and what, if any, modifications "should be made to the TSV Exemption"`.
- **Compensation mesurée, indissociable** (sans elle, la page 4 réapparaît) : remplacer `invites modifications (Section VI, Question 6, p. 58)`
  par `invites modifications (Question 6, p. 58)`. Q6 reste identifiée sans ambiguïté, et la section VI est déjà citée l.16 et l.20.
- Motif : ordre p.58 l.2047 « What, if any, modifications ». La paraphrase actuelle présente la Commission comme présupposant des modifications.
- `error_origin` : worker v3 (ajout de la sous-question sans « if any » ; coupe D-v3-5).

**C-G2-5 — non bloquante — l.18 et l.45 (jargon et ambiguïté).**
- (i) Remplacer `It observes that AMM transparency` par `It observes that automated market maker (AMM) transparency`.
- (ii) Remplacer `counted once per signature and converted to shares with the on-chain multiplier` par
  `counted once per transaction and converted to shares with the on-chain shares-per-token multiplier`.
- Preuves :
  - dédoublonnage par signature = par transaction (`collect.ts` l.337-342) ;
  - le multiplicateur est un nombre d'actions par token (`volume.ts` l.46-47 : `shares = tokens * multiplierNum`) ;
  - la collision « signature » (transaction) contre « signed » (Ed25519, l.60) disparaît.
- `error_origin` : worker v3 (coupes D-v3-5 de « automated market maker », « transaction », « token's »).

**C-G2-6 — non bloquante, optionnelle — l.43 (syntaxe du bouclier ; rien n'est retiré).**
- Remplacer `It measures no effect on the underlying market, its opening, reopening or closing processes, or of ten-minute reporting, and implies no causal link.`
- par `It measures no effect of overnight trading or of ten-minute reporting on the underlying market or on its opening, reopening or closing processes, and implies no causal link.`
- Motif : parallélisme « effect on … or of … » rompu. La nouvelle phrase reprend la structure de Q3 (p.57 l.2042-2045). Le ruling
  « ne pas couper » (AVIS l.36) vise le contenu, qui est conservé et ne fait que s'étendre (« overnight trading »). L'orchestrateur peut la décliner.
- `error_origin` : worker (squelette ; phrase reconduite v2, v3).

**C-G2-7 — non bloquante — l.58 (« second method » non défini en v3).**
- Remplacer `a second method gave the same history, event for event.`
- par `a second method, scanning the transactions of the account authorized to update the multiplier, gave the same history, event for event.`
- Preuves : définition de la v2 l.69 ; trajectoire `authority` (`collect.ts` l.566-579) ; CHANTIERS:838 (« full-mint == serie hybride committee »).
  La §4 l.69 renvoie aussi à « the second method ».
- `error_origin` : worker v3 (définition coupée).

**C-G2-8 — non bloquante — l.60 et placeholder `url_method` l.79 (fait OTS dépassé pendant la revue).**
- (i) Remplacer `12 of 15 anchor proofs upgraded to Bitcoin attestations on 2026-09-23; the remaining 3 are published as they upgrade.`
  par `15 of 15 anchor proofs upgraded to Bitcoin attestations on 2026-09-23.` (-8 mots).
- (ii) Dans `url_method`, remplacer `et réécrire « the remaining 3 are published as they upgrade », « over a period stated in its method » et « by a published rule »`
  par `et réécrire « over a period stated in its method » et « by a published rule »` : le segment visé n'existe plus.
- Motif : à 07:14:29Z (`fdf1589`), les 3 preuves restantes ont été mises à niveau : 15/15, blocs 968225/968226, vérifié octet par octet au
  HEAD `d55fbb7` avec `ots-heights.mjs`. Lu comme un énoncé sur la journée du 2026-09-23, « 12 of 15 » est devenu inexact, et « the remaining
  3 » est sans objet. Le sens est celui que l'orchestrateur a consigné (entrée CHANTIERS « 07:14 UTC » : « à réécrire « 15 of 15 … on
  2026-09-23 » »).
- Réserves :
  - phrase dictée ⇒ ruling de l'autorité qui l'a dictée ;
  - le compte changera encore (`mint_end-SPYx`, `final`) : rafraîchissement I-v3-2 au remplissage, et `ots verify` au dépôt ;
  - la publication des preuves reste portée par `url_method` (§5 : « links to … the anchors »).
- `error_origin` : sans objet (fait postérieur à la livraison : `766402e` → `fdf1589`).

## 8. Observations (disposition formée ; aucune n'est une correction)
- **O-1 — bandeau l.1.** « each one names its source and trigger » est faux en ligne :
  - `<<DATE>>` et `<<SIGNATAIRE>>` n'ont ni source ni déclencheur ;
  - `window_TSLAx`, `n_*`, `relation_commerciale` et `contact` n'ont pas de déclencheur explicite.
  - RENDU §5 les porte tous. Disposition : à la prochaine révision, « names its source; triggers in RENDU-v3.md §5 » (bandeau interne, retiré
    au dépôt).
- **O-2 — l.20.** « invites modifications » serait plus exact en « invites proposed modifications » (l'ordre demande de « provide any potential
  modifications »). Disposition : style, +1 mot, à re-mesurer si retenu.
- **O-3 — l.20.** L'idiome « asks … the effects of » gagnerait à revenir à « what effects … could have » (v2). Mesuré : avec C-G2-1 seule,
  +1 mot net fait passer à 4 pages. Disposition : seulement avec une coupe compensatoire, ou si le 12 pt est abandonné (l'AVIS l.37 en fait une
  contrainte interne).
- **O-4 — l.51-54.** Les 4 propriétés sont au présent de spécification sous un chapeau conditionnel (« could expect »). C'est acceptable pour
  une lettre de commentaire. Option : « would identify / would give / would carry / would state » (+4 mots, à mesurer) si l'orchestrateur veut
  un conditionnel strict.
- **O-5 — l.18.** Douze mots sont verbatim hors guillemets (« recognizes that a TSV may inadvertently exceed a volume threshold, for example »,
  p.26 l.1011-1012). Option à 0 mot : étendre la citation à « recognizes that … for example, due to a miscalculation in either a numerator or
  denominator » (22 mots ≤ 25 ; virgule de l'ordre après « for example »). Disposition : orchestrateur.
- **O-6 — l.49.** « each lets a third party recompute what a venue reports » : (b) et (d) servent le recalcul indirectement. Option à +1 mot :
  « together they let ». Disposition : orchestrateur.
- **O-7 — l.12 et l.56.** « Bell applies these properties » est une application par analogie :
  - (a) Bell publie des agrégats, pas des identifiants par transaction ;
  - (c) l'état et la timeline publiés portent un digest (`bell_sha`), mais l'ancrage OTS porte sur les journaux de collecte, pas sur les
    publications (D-v3-4 l'a respecté).
  - Chaque démonstration borne sa portée ; aucun énoncé n'est faux. Disposition : aucune action requise.
- **O-8 — l.45, unité du numérateur.** `vol_ratio` = volume **total** de la fenêtre ÷ ADV **journalier**. Sonde cas C : 30 tokens × 1,5 / 1e6 =
  4,5e-5 sur une fenêtre de 2 jours, sans moyenne par jour. L'arithmétique II.F est ADV/ADV (p.24 l.902-906). La lettre ne publie aucun chiffre
  et reste littéralement exacte (« the volume in its observed pools »), mais elle invite une lecture de même nature. Disposition : étendre
  **I-v3-1** à l'unité du numérateur (I-G2-3). Si le total est gardé, écrire « the volume in its observed pools over that window » (+3 mots, à
  mesurer).
- **O-9 — l.26.** « of the token's on-chain fills » a perdu « in the session » (coupe D-v3-5). La définition de P_session n'est plus bornée
  qu'implicitement par l'indice. Option : +3 mots, à mesurer. Disposition : orchestrateur.
- **O-10 — l.58.** « A defective page » n'est pas défini.
  - Le code classe aussi une page courte non finale comme faute (`rebase-crosscheck.ts` l.311-317, l.340).
  - Les trois complétions ont tourné avec `require_full_pages:false` (`budget.json` ×3) et ont committé la page courte finale (page suivante
    vide, ancre de fin OK ; CHANTIERS:838/898/964). La phrase n'est donc pas contredite.
  - Version exacte disponible : « A page with an unreadable transaction, an out-of-order slot or a multiplier-event mismatch is not recorded
    and stops the run » (+6 mots, à mesurer).
  - Disposition : orchestrateur (D-v3-6).
- **O-11 — l.58, « bit for bit ».** Le recalcul bit à bit est établi pour un rejeu à partir d'une série de fills (ADR-T1aii C-5 l.31). Pour
  qu'un tiers re-lise le registre de façon indépendante, l'ensemble de fills de Bell doit être reproductible. Or le collecteur saute les corps
  illisibles (`collect.ts` l.355-361) sans publier leur signature ; la couverture publiée ne compte que l'échantillon sous quorum (l.365-366).
  La condition `url_method` ne couvre que la publication du code. Disposition : **I-G2-4**.
- **O-12 — l.58 et l.60.** Deux phrases dépendent de la course -b1-bis-ii (NOTE-DEPOT C-5, item I-7), pas seulement de T-1b :
  - « at each start, end and resumption of a run » est vrai pour go-1 (ANCHORS l.37-54) mais s'étend à la course fondatrice (chiffres Q3),
    qui n'est pas encore ancrée ;
  - « used for per-share prices » a pour consommateur la course -b1-bis-ii (ADR-T1aii l.337-338, « upcoming »).
  - Disposition : déclencheur des `t4_*` à préciser en « terminée et ancrée à chacune de ses frontières (NOTE-DEPOT C-5) », et ligne à ajouter
    au RENDU §6.
- **O-13 — l.60, phrase dictée.** Deux points :
  - (i) date ISO « 2026-09-23 », quand le reste de la lettre écrit « September 17, 2026 » ;
  - (ii) « are published as they upgrade » est un présent d'habitude qui décrit un processus futur. Ce point tombe avec C-G2-8.
  - Disposition pour (i) : ruling de l'autorité qui a dicté la phrase, au rafraîchissement I-v3-2 (rulings (c) et (d) du 06:38).
- **O-14 — l.63.** « dedicated host » peut se lire comme un serveur physique dédié ; l'hôte est un VPS KVM 2 (CHANTIERS:123), dédié à Bell et à
  la sonde externe (CHANTIERS:120). Option à 0 mot : « a separate server ». Disposition : orchestrateur (la formule ESC-2 dit aussi « dedicated
  host »).
- **O-15 — l.70.** « over the stated windows » : la lettre n'énonce qu'une fenêtre (`window_TSLAx`), les autres sont dans l'état servi.
  Disposition : style, orchestrateur.
- **O-16 — SOURCES et NOTE-DEPOT.** La lettre n'est pas rouverte sur « (Helius) ».
  - SOURCES §B l.113 (« Aucun fournisseur de données nommé (ni close, ni RPC) ») est périmé depuis la v2 (D-v2-5, D-v3-11).
  - NOTE-DEPOT C-9 vise `<REF:cong_ssrn>`, absent depuis la v2.
  - Disposition : mettre SOURCES §B à jour à sa prochaine révision ; clore C-9 « sans objet », ou réintroduire l'identifiant SSRN après lecture
    sur place.
- **O-17 — RENDU V3-3.** Le document cite l.306 pour le retour immédiat ; c'est l.308 (l.306 = `pageEvents.push`). Disposition : erratum au
  RENDU, sans effet sur la lettre.
- **O-18 — RENDU §2.** Trois micro-éditions ne sont pas listées :
  - la phrase « We comment on Questions 3 and 6 only. » est fondue dans « On Questions 3 and 6, … » (perte de « only ») ;
  - « from public ledger data » est retiré de la phrase de recalcul ;
  - en §4, « pools identified on-chain » est retiré ; les alinéas §1 al.1-2 sont fusionnés.
  - Aucune ne change un fait sourcé. Disposition : note d'historique ; aucune action sur la lettre.
- **O-19 — l.12.** « anyone can recompute it » suppose une licence pour le close et l'ADV, ce que dit la §3 l.58. La clause « sinon » de
  `url_method` couvre déjà son retrait. Disposition : aucune.
- **O-20 — l.45, « consolidated average daily share volume ».** La nature consolidée de l'ADV ne repose que sur `volume.ts` l.4-5, que le code
  qualifie lui-même de **[2nd]** (« Polygon redistributes the consolidated tape »). Aucune lecture de première main n'existe dans le dépôt
  (`docs/biblio/bell/` : aucune note Massive/Polygon sur la base du volume des agrégats ; R-gtm ne couvre que la licence et le changement de
  nom). L'enjeu : II.F prend pour dénominateur l'ADV « as reported by an effective transaction reporting plan » (p.24 l.899-906).
  - Disposition : **I-G2-5** (demande formée).
  - Repli, s'il n'est pas établi au remplissage : écrire « the underlying stock's average daily share volume » (-1 mot) et énoncer la source
    et sa couverture sur `/bell/method` (I-v3-1).

## 9. Items formés par cette G2 (propriétaire et déclencheur ; aucun dû nu)

| # | Item | Propriétaire | Déclencheur |
|---|---|---|---|
| I-G2-1 | **Fait (iii) fail-closed.** (a) Mint illisible ⇒ le ratio s'abstient avec un résiduel nommé et compté, jamais « 1 » par défaut. (b) ADV absent ou ≤ 0 ⇒ résiduel nommé et compté (par ex. `no_adv_ref`). (c) Test non-LLM = cas A et B de `F:\tmp\g2-sec-v3\probe-q6.mts` en assertions, rouges sur `collect.ts` @ `dd9cd48`. Couvre aussi l.45 « converted … with the on-chain multiplier » sur ce chemin. Une fois livré, C-G2-1 peut être réélargi (ruling). | orchestrateur → worker du lot T-1b (ou -b1-bis-ii si la course sert `state.json` avant) | G0 T-1b, avant que `state.json` soit servi et avant que `/bell/method` énonce la liste des résidus |
| I-G2-2 | **Procurement ou lecture sur place : périmètre des sauvegardes du VPS Bell.** Documents : l'aide Hostinger sur les sauvegardes VPS (hebdomadaires, image disque ou non, exclusions possibles) et la configuration hPanel du VPS `srv1993906`. URL exacte non devinée ; aucune tentative (mission sans réseau). Usage : trancher C-G2-3 et la formule ESC-2 de `/bell/method`. Si l'image contient la clé : exclure le chemin ou désactiver la sauvegarde fournisseur (décision et coût investisseur), ou garder « is generated on it ». | orchestrateur (navigateur interne puis externe, règle « lecture sur place ») ; acte investisseur si ESC-2 change | avant la génération de la clé Ed25519 (T-1b, RUNBOOK-bell), et au plus tard avant le dépôt |
| I-G2-3 | **Extension de I-v3-1 : unité du numérateur Q6.** Le code publie total de fenêtre / ADV journalier ; II.F calcule ADV/ADV (p.24 l.902-906). Choix, test non-LLM (mutant « moyenne par jour » ⇒ rouge sur la valeur épinglée) et alignement de la phrase l.45. | celui de I-v3-1 | celui de I-v3-1 (G0 T-1b, avant `/bell/method`) |
| I-G2-4 | **Base du « bit for bit ».** Publier, par session, l'ensemble des signatures de fills (ou son digest avec la liste des corps sautés), ou garantir un chemin de course sans corps sauté (fail-closed). Test non-LLM : mutant « corps sauté sans trace publiée » ⇒ rouge. Sinon, réduire la phrase à « from the fills Bell records » ou retirer « bit for bit » (clause `url_method`). | orchestrateur → lot -b1-bis-ii / T-1b | G0 -b1-bis-ii (chemin de collecte de la course fondatrice), avant remplissage de `url_method` |
| I-G2-5 | **Procurement ou lecture sur place : base de volume des agrégats journaliers Massive/Polygon** (`/v2/aggs/ticker/{T}/range/1/day`, champ `v` ; lu par `collect.ts` l.389-390). Documents : la référence API Massive (ex-Polygon) du point `aggs`, et la page de méthodologie des agrégats (volume consolidé toutes places, ou périmètre, conditions de vente exclues). URL exacte non devinée ; aucune tentative (mission sans réseau). Usage : établir « consolidated » à la l.45 et la phrase de source de `/bell/method` ; sinon, repli d'O-20. | orchestrateur (lecture sur place) ou chercheur | avant la rédaction de `/bell/method` (I-v3-1), et au plus tard avant le remplissage de la lettre |

Items du RENDU relus :
- I-v3-1 à I-v3-6 ont tous un propriétaire et un déclencheur.
- I-v3-5 est clos (ruling (c)).
- I-v3-6 doit inclure le rejeu de `measure-g2.sh` (ou de `measure.sh`) : la marge à 12 pt est d'environ 1 ligne après C-G2-1 seule, et
  d'environ 2 lignes avec le jeu {1..8}. Les valeurs réelles de `relation_commerciale` et des URL peuvent la consommer.
- I-v3-2 : rafraîchissement déjà engagé par l'orchestrateur (entrée CHANTIERS « 07:14 UTC ») ; C-G2-8 en donne le texte au HEAD `d55fbb7`.

## 10. Journal (horloge `date -u`)
- 06:39:30Z — Début. Empreintes des 7 entrées égales au RENDU. Ordre pré-extrait `adee69f6…` et PDF `67bfb89a…` égaux à SOURCES.
- 06:40Z-06:55Z — Lectures intégrales.
  - Documents : lettre v3, RENDU-v3, AVIS, v2, SOURCES, NOTE-DEPOT, FAITS-Ross ; CHANTIERS l.55, 59, 119-123, 215, 818-819, 838, 898-899,
    915-921, 964, 992, 1016-1020.
  - Code Bell : `collect.ts` l.1-600 ; `volume.ts`, `sessions.ts`, `residuals.ts` entiers ; `close.ts` l.1-40 ; `supply.ts` l.180-196 ;
    `rebase-crosscheck.ts` (`a703e244…`) l.1-80, 200-360.
  - Artefacts : ANCHORS entier ; `git show 766402e --stat` ; 3 `crosscheck-*.json`, `budget.json` et `crosscheck-report.json` des répertoires
    de complétion ; manifestes `mint_end-*`.
  - Textes primaires : ordre aux lignes citées et à leur contexte ; Cong l.1-8 et l.1315-1363.
  - Rejeux : harnais du worker.
- 06:55:35Z — Premier état durable du rendu.
- Entre 06:55:35Z et 07:09:25Z (bornes lues à l'horloge ; l'appel lui-même n'a pas été horodaté) — **Consultation 1 de l'advisor intégré**
  (après orientation, avant de figer la liste ; conseil, jamais verdict).
  - Apport : confirmation que C-1 (sonde) est bloquante ; ajout de C-2 (placeholders), C-3 (« AMM »), C-4 (parallélisme du bouclier) et C-5
    (« second method ») ; observations sur le présent de spécification, la généralité de l'ancrage, « the stated windows » et le sha du squelette ;
    liste « ne pas rouvrir » (`harness`, « attestations », « (Helius) », 1 318 mots).
  - Suites : tout est suivi. J'ai **ajouté**, hors avis, C-G2-3 (clé et sauvegardes), C-G2-4 (« if any »), O-8 (unité du numérateur) et O-11
    (base du « bit for bit »), chacun avec sa preuve.
- 07:00Z-07:09Z — Corrections appliquées sur copies et mesurées. Variantes longues de C-G2-3 et C-G2-4 écartées ; variantes finales en 3 pages.
- 07:10:42Z — Rejeu de la sonde avec `git status` avant et après (`probe-q6.out`) ; constat du HEAD `0383e5b` et vérification de l'identité des
  objets revus.
- 07:12:08Z — Rédaction du rendu complet.
- 07:15Z-07:20Z — Auto-contrôle avant clôture. J'ai trouvé et corrigé 2 erreurs de ma version :
  - les items (ii)-(v) de II.G sont en p.29 (l.1097-1099), pas en p.28 ;
  - la citation étendue d'O-5 fait 22 mots, pas 21.
  - C-G2-2 est aussi rendu autonome : le placeholder ne renvoie plus à un identifiant de ce rendu. La variante a été reconstruite et
    re-vérifiée (3 pages, 14 placeholders, 0 hit, 0 CR).
- 07:15:53Z — HEAD `d55fbb7` : `fdf1589` porte les preuves OTS à 15/15, vérifié à l'octet ⇒ C-G2-8. Lettre, RENDU et lignes citées inchangés.
  Le fichier non suivi (note Ukemi) vient d'un autre agent.
- Entre 07:17:52Z et 07:23:14Z — **Consultation 2 de l'advisor intégré** (avant clôture, rendu déjà durable ; conseil, jamais verdict).
  - Apport : (1) monter le « consolidated » du close de [lu-worker] à la note locale Databento ; (2) promouvoir le constat OTS en correction
    non bloquante ; (3) écrire des bornes horaires pour les consultations ; (4) prouver la moitié « multiplicateur » de C-G2-1 avec le même
    outil ; (5) procédure de clôture ; liste « ne pas rouvrir » inchangée.
  - Suites : tout est suivi.
    - (1) fait : note l.29 ; l'examen a en plus révélé que l'ADV « consolidated » repose sur une base [2nd] ⇒ O-20 et I-G2-5 ;
    - (2) C-G2-8, qui met aussi à jour la clause `url_method` ;
    - (3) bornes écrites ;
    - (4) cas D/E ajoutés, re-joués à 07:23:14Z avec `git status` avant et après ;
    - (5) voir la ligne de clôture.
- 07:23Z-07:26Z — Variante finale {1..8} reconstruite et re-vérifiée (3 pages, 495/430/444 ; 14 placeholders ; 0 hit ; 0 CR ; vocabulaire
  inchangé). Rendu mis à jour.
- **07:26:28Z — Clôture.** HEAD `d55fbb778e645e06bdee76a27874b272261f9d11`, aucun commit après `d55fbb7`. Lettre `850e743e…3716` et RENDU
  `ebfa8fa7…a822` inchangés. `git status --short` = la seule note Ukemi non suivie d'un autre agent. Le sha256 de ce fichier, calculé après
  cette dernière écriture, est dans le message de rendu.

## 11. Rejeu (R-21) — commandes (`<sp>` = scratchpad du worker, `<g2>` = `F:\tmp\g2-sec-v3`)
- Citations : `node <g2>/cite-check.mjs F:/Monark/docs/sec-4927/LETTRE-4-927-v3.md` ; `node <sp>/v2/check-v2.mjs <idem>`.
- Vocabulaire : `cd F:/Monark && node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v3.md` (puis sans argument, pour 224) ;
  `node <sp>/v2/check-vocab-v2.mjs <lettre>`.
- Forme : `node <sp>/v2/wordcount.mjs <v2> <v3>` ; `node <sp>/v3/section-words.mjs <v3>` ; `node <sp>/v2/check-md-tables.mjs <v3>` ;
  `tr -cd '\r' < <v3> | wc -c`.
- Diff : `node <g2>/sent-diff.mjs <v2> <v3>`.
- Pages : `bash <g2>/measure-g2.sh <sp>/v3/render-v3.mjs <v3> g2-v3-12pt 24 276` (même principe pour `22 252`), puis
  `bash <g2>/measure-g2.sh <sp>/v2/render-v2.mjs <v2> g2-cal-v2-12pt 24 276`.
- Corrections : `node <g2>/apply-corrections.mjs <v3> <g2>/variants/final-set.md C-G2-1,C-G2-2,C-G2-3b,C-G2-4d,C-G2-5,C-G2-6,C-G2-7,C-G2-8`,
  puis `measure-g2.sh` sur ce fichier. Correspondance : C-G2-3 du rendu = clé `C-G2-3b` du script ; C-G2-4 = clé `C-G2-4d`. Les clés
  `C-G2-3`, `C-G2-4`, `C-G2-4b` et `C-G2-4c` sont les variantes écartées, mesurées à 4 pages. La clé `O-20` du script est l'essai
  intermédiaire de la réécriture OTS, remplacé par `C-G2-8` ; ce n'est pas l'observation O-20 du rendu.
- Sonde : `node <g2>/probe-q6.mts` (Node 24 ; importe `collect.ts` et `supply.ts` en lecture seule ; cas A à E).
- OTS : `git show 766402e --stat` ; `node <sp>/v3/ots-heights.mjs F:/Monark/docs/course-bell`.
- Mints : `sha256sum F:/course-bell/bell-b3d-run-{tslax,aaplx,nvdax}-completion/crosscheck-*.json` puis `grep` dans
  `docs/course-bell/mint_end-*-manifest.txt`.

## 12. Empreintes des artefacts du relecteur (sha256)
- `cite-check.mjs` : `4e7e69d045429a811f43877dc4771f78bcc66f632e26467875c140748060a37e`
- `sent-diff.mjs` : `f0b8b879384012fb4b06e06754e88751703dae156400ba8a6963350df4c3220e`
- `probe-q6.mts` : `69f0a2a400eed59912729a2a5ab6146a99a8eed7f87cd02ee4f24c11949538f3` (cas A à E)
- `probe-q6.out` : `fb7fa05e7edcf4223085f464bd0b76698aae2a62e8376514bad1c6c4b5302af7` (rejeu du 07:23:14Z, HEAD `d55fbb7`)
- `measure-g2.sh` : `c1a3d9033081153053854645bdca459dac331cdb1c4af9cb87f6fbaa639d01a9`
- `apply-corrections.mjs` : `43137a4e0c77610dd6ffa46ddd4cd52a663f208847d65017cbd554139ce48e21`
- `variants/final-set.md` (jeu {1..8}) : `c9fcca4baac5bace3cd4f71145eff56a32f0ac87b320c2c8c421900f044a09f1`
- `variants/final-set-o20.md` (essai intermédiaire, remplacé) : `d34c058034f11113fa2298dc8340e064677d4fdbde3bf01ce327b737681aa213`
- Ce fichier : un fichier ne peut pas contenir son propre sha256 ; la valeur est donnée dans le message de rendu.

Aucun commit (R-20), aucun workflow, aucun appel réseau ; aucune écriture hors de `F:\tmp\g2-sec-v3\`.
