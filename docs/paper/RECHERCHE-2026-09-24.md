# RECHERCHE — papier de méthode MONARK Bell, lot PAPER-METHOD-1 (décision investisseur 200), 2026-09-24

> Archive de chercheur, écrite au fil de l'eau (sections datées). Donnée brute pour l'orchestrateur : jamais consommée comme preuve sans relecture (R-21). Aucun commit (R-20). Aucune adresse e-mail, aucun nom de fournisseur de données, aucune valeur de close / VWAP / volume consolidé dans ce fichier.

## 0. Identification de la passe

- **Gate 0** : modèle résolu déclaré par le harness = `claude-opus-5-5[1m]` ; préfixe attendu `claude-opus-5-5` (décision 133 du 2026-09-22) : **conforme**.
- **Mission** : orchestrateur MONARK, lot PAPER-METHOD-1, décision investisseur 200 (« session-level, signed and replayable measurement of tokenized equity price gaps », MONARK Bell, auteur Stan E Malone, Founder, MONARK). Ouverture de la passe : 2026-09-24T16:43:56Z (`date -u`).
- **Dépôt** : `F:\Monark`, branche `lot/etude-suite`, tête `156ec7d47500fc3468cb99d49412bcf994243ab0` (lecture seule ; seule écriture : ce fichier).
- **Entrées lues avant tout réseau** (sha256 au moment de la lecture) :
  - `docs/paper/FAITS-arxiv-ssrn-2026-09-24.md` `758f52d84f34e9d2fae8b116bce757ea4ec2b082866118cbb75e3b052b13e31e` (faits de l'orchestrateur, pris tels quels, non re-devinés)
  - `docs/sec-4927/LETTRE-4-927-v4.md` `e6edbddc6c26b955b0a7183021ea77f0e704c6fcabd62062a6416339510f204f`
  - `docs/sec-4927/SOURCES.md` `463f3738abdbb39edf93e287c835f755dd4e97791b338ac1a434b8c201f3040b`
  - `apps/site/app/bell/method/page.tsx` `ac9c1806930f7e5dc03982180d637b758d1450af57d74c0b6b86977953f41c76`
  - `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` `feaff77007b5aa9dcbc58c16e4797fb8888012e9a305fe57971ac551348ef530` (§0, §0 bis, §1, D1, D4, §8-§11, amendements)
  - `docs/adr/ADR-U4b-2b-classe-servie.md` `3ae31f7bcf1db3c32a27cc701139284a1577008f335416fb0aae9f5e3ce04265` (§0, §0 bis, §1.1-§1.3)
  - `docs/CHANTIERS.md` `07a6b803ce24f9bc17fbbcb717fe36c35ade54dcdb11002ed7494dd839d5acc8` (l.208, l.223 : décision 69 et sa correction ; l.1372 : décision 165) ; `docs/adr/ADR-B0-programme-bell.md` (l.28, l.53, l.74, l.128 : ESC-1 (c)) lu par grep.
- **Outillage de la session (mesuré)** : outils différés exposés = WebFetch, WebSearch, memstack. **Firecrawl non exposé** (aucun outil `mcp__6fa0ba96-…` dans la liste de cette session ; non contourné) ; semantic-scholar et openalex annoncés par le harness mais sans outil appelable. memstack interrogé une fois (« papier de méthode MONARK Bell arXiv SSRN endossement catégorie q-fin ») : aucun souvenir pertinent. `curl 8.21.0` (Git Bash) disponible : utilisé seulement pour des GET de pages HTML publiques filtrés par `grep`/`sed` en mémoire, sans téléchargement de PDF.
- **Conventions de niveau** : `[lu-WF]` = page lue par ce chercheur via WebFetch (le texte est rendu par un petit modèle : une citation n'est tenue pour verbatim que si elle a aussi été retrouvée dans les octets bruts, sinon marquée « rendu WF ») ; `[lu-curl]` = octets HTML bruts lus par GET puis filtrés (verbatim au caractère près, entités HTML décodées) ; `[lu-orch]` = lu sur place par l'orchestrateur (fichier FAITS), non relu ici sauf mention ; `[abs]` = résumé primaire seul ; `[2nd]` = mention secondaire, jamais terminale (procurement formé). Classes : P1 primaire, P2 presse/recherche indépendante, P3 promo/agrégateur (signalé). Citations ≤ 25 mots, avec URL et heure `date -u` de la lecture.
- **Advisor** : une consultation de l'advisor intégré AVANT toute extraction réseau (transcript sans texte tiers long) ; conseil suivi pour l'ordre des sections. Aucune consultation intégrée pendant ou après l'extraction (règle mainteneur 2026-09-05, filtre de régurgitation) : toute question restante part en demande formée (§9).


> **Ordre de lecture** : les sections portent les numéros de la mission (1 à 5) ; elles ont été écrites dans l'ordre 4, 1, 2, 5, 3 (au fil de l'eau, chacune datée), puis §6 à §12 (contradictions, NON TROUVÉ, procurements, demandes de consultation, journal des URL, décisions à prendre, clôture).

---

## 4. Ce que le papier ne doit pas faire (écrit à 2026-09-24T16:51:58Z, zéro réseau, sources du dépôt uniquement)

*Reprise après coupure de courant : archive relue à 2026-09-24T16:50:21Z (3 822 octets, sha256 `7f969f69a4710a6f58ed197c5d5c65a24dc760f09486c07c99becc4c0e00661c`, §0 seule présente) ; deux tentatives d'ajout de cette section par heredoc ont échoué sur une erreur d'analyse du shell (rien d'écrit) ; section passée par un fichier intermédiaire du scratchpad.*

**Règle de cette section** : aucune condition de fournisseur n'a été relue ; aucun fournisseur n'est nommé ; aucune valeur n'est citée. Tout vient de décisions et d'ADR déjà consignés dans le dépôt (lus ce jour, lignes citées). Les noms de fournisseurs présents dans ces fichiers ne sont pas reproduits, ni les identifiants d'items qui en contiennent une abréviation.

### 4.1 Le principe « écarts oui, niveaux non », tel que le dépôt l'a décidé

| # | Règle | Source dans le dépôt | Niveau |
|---|---|---|---|
| 4-a | Bell publie l'écart seul ; le close de référence reste une entrée **non republiée** ; un tiers rejoue avec sa propre licence de données (ESC-1, option (c), décision investisseur du 2026-09-19). | `docs/adr/ADR-B0-programme-bell.md:128` | [lu] |
| 4-b | **Aucun engagement ni hash (salé) du close n'est publié** : motif consigné, un hash à sel public d'un prix est énumérable (faible entropie) et l'intégrité de g est déjà portée par la chaîne signée. | `ADR-B0-programme-bell.md:128`, `:74` | [lu] |
| 4-c | Ce que la licence protège, selon le dépôt, est **le flux reproduit verbatim**, pas le fait public qu'est un prix de clôture ; garde de code : un champ numérique de close dans un fichier publié fait rougir un mutant. | `ADR-B0-programme-bell.md:128`, `:53`, `:50` | [lu] |
| 4-d | Volume consolidé (ADV) : **ratio seul publié, ADV jamais verbatim** (application conservatrice d'ESC-1 (c)) ; garde étendue aux clés `adv`, `share_volume`, `volume_ref`. Amendement du 2026-09-19 : ESC-1 (c) « accepte la recomposition et ne protège que le verbatim ». | `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md:32` | [lu] |
| 4-e | Page servie : « The record has no closing-price field, and the close source is described here, not named. » ; la garde de digest refuse toute valeur numérique sous une clé nommant un close, un prix de référence, un volume journalier moyen ou un volume en actions ; le VWAP on-chain et le volume de base sont portés. | `apps/site/app/bell/method/page.tsx` (sections `refclose` et `digest`) | [lu] |
| 4-f | Page servie : « The ratio values are not rendered on this site. » (le ratio est dans l'état publié, pas rendu sur le site). | `method/page.tsx`, section `formulas`, carte « Volume ratio » | [lu] |
| 4-g | Lettre v4 : closes et volumes journaliers « obtained under the reader's license and never republished by Bell ». | `docs/sec-4927/LETTRE-4-927-v4.md`, §3, puce « Recomputable » | [lu] |
| 4-h | Aucun fournisseur de données nommé (ni close, ni RPC), lecture conservatrice de la décision 69 ; aucun placeholder ne porte l'ADV ni le close. | `docs/sec-4927/SOURCES.md` §B, §C (nota), Q3-4 | [lu] |
| 4-i | Décision 69 (2026-09-20) : le recoupement du close chez un second fournisseur est autorisé mais **mentionné sur aucune surface publique** de la release ; la surface Bell ne publie que les codes génériques `cash_cross_mismatch` / `cash_cross_unavailable`. | `docs/CHANTIERS.md:208` | [lu] |
| 4-j | Correction de la décision 69 : la garde « aucun nom de fournisseur » n'est **pas** écrite dans la liste de vocabulaire exportée (elle publierait le nom qu'elle interdit) ; c'est un test racine non exporté qui scanne les fichiers exportés. | `docs/CHANTIERS.md:223` | [lu] |
| 4-k | Décision 165 (2026-09-24 01:07 UTC) : source du close inchangée ; une licence doit être acquise par l'investisseur (butoir 2026-12-24) ; **avis juriste attendu** ; détail confidentiel hors dépôt ; une **forme binnée** de publication est le repli si l'avis est défavorable. | `docs/CHANTIERS.md:1372` | [lu] (le fichier confidentiel n'a pas été ouvert) |

**Énoncé du principe pour le papier** ([analyse] du chercheur, reposant sur 4-a à 4-k) : le papier imprime des grandeurs **dérivées** (g = ln(P_session / P_close), indicateurs exceeds(θ), parts par régime, ratio de volume si l'investisseur le décide, voir 4.3) et **jamais un niveau sous licence** (close, prix de référence, ADV, volume consolidé en actions), ni en table, ni en figure, ni en annexe, ni dans un fichier auxiliaire, ni sous forme de hash. Le lecteur reçoit la formule et la liste de ce qu'il doit apporter sous sa propre licence (carte « What you bring » de la page de méthode).

### 4.2 Interdits dérivés, chacun rattaché

1. **Nommer un fournisseur de données** (close, volumes, RPC) : 4-h, 4-i, 4-j. Le papier décrit la source (clôture consolidée de fin de journée, relue sur une seconde source à échelle fixe) sans la nommer, comme la page de méthode (section `refclose`).
2. **Imprimer un niveau sous licence ou un hash de ce niveau** : 4-a à 4-e. Vaut aussi pour les fichiers auxiliaires d'arXiv (§5) et pour tout jeu de données joint.
3. **Revendiquer la vérité des faits par la signature ou l'ancre** : la signature montre l'origine (`ADR-BELL-OTS-ANCHOR-1.md` D4, « Ce que cela ne montre pas ») ; l'ancre montre qu'une tête de journal existait avant un bloc Bitcoin, ni la provenance des pages ni l'exécution du scan (lettre v4 §3 ; page de méthode, section `anchors`).
4. **Retirer la clause « not checked against a node »** d'une phrase publique sur les ancres tant que l'item BELL-OTS-NODE-VERIFY-1 est ouvert : l'amendement du 2026-09-24 15:03 UTC ne lève la condition que pour le dépôt de la lettre v4 (`ADR-BELL-OTS-ANCHOR-1.md`, dernier amendement) ; un papier public est une nouvelle surface.
5. **Dire « anchored » pour les publications** tant que la page servie dit « signed and chained, not timestamp-anchored » (`method/page.tsx`, sections `digest` et `anchors`) et que la lettre dit « Timestamp anchoring of these publications is in preparation » (lettre v4 §3).
6. **Toute phrase causale** sur l'effet du trading hors séance ou du reporting à dix minutes : lettre v4 §2 (« implies no causal link ») ; `SOURCES.md` Q3-10.
7. **Comparer à Cong et al. autrement que de façon descriptive** : unités, sources de close, échantillons, définitions de session diffèrent (lettre v4 §2 ; `SOURCES.md` Q3-9).
8. **Affirmer une nouveauté exclusive** (« first », « only ») : `SOURCES.md` §B (littérature non lue en entier) ; vaut a fortiori pour un papier dont la revue de littérature du §3 est partielle.
9. **Présenter Bell comme TSV, Covered Firm, certification ou évaluation de conformité** : lettre v4 §4.
10. **Généraliser hors échantillon** (quatre symboles, une famille, une chaîne, fenêtres déclarées) : lettre v4 §4.
11. **Chiffres de marché** (capitalisations, volumes en dollars, parts de marché) : `SOURCES.md` §B.

### 4.3 Points que le dépôt ne tranche pas pour un papier (à l'investisseur, avec l'avis juriste de la décision 165)

- **Dérivabilité** : le dépôt consigne que le close est dérivable de g publié et du VWAP on-chain public (`ADR-B0-programme-bell.md:74`, `:128`) et que l'ADV l'est, moins précisément, du ratio (`ADR-T1aii-bell-collecteur-course-fondatrice.md:32`). La position du dépôt (la licence protège le verbatim, pas le fait) est **une position en attente d'un avis juriste** (4-k), pas un acquis. Conséquence proposée [analyse] : le papier n'imprime pas g et VWAP_share d'une même session côte à côte ; il imprime des distributions ou des parts (exceeds(θ) par régime, quantiles de g) ; la forme binnée (4-k) est le repli naturel si l'avis est défavorable.
- **Ratio de volume** : publié dans l'état servi mais **non rendu sur le site** (4-f). Le papier doit choisir entre la règle du site (aucune valeur de ratio) et celle de l'état publié ; le chercheur ne tranche pas.
- **Vocabulaire** : `SOURCES.md` (§A, « Non cité, volontairement ») indique que le gate de vocabulaire des scopes `site`/`harness` fait rougir « accuracy » et les formes guarantee/verified/confidence. Un papier de statistique emploie « coverage », « confidence » au sens technique (prédiction conforme) : décider si le gate s'applique au papier, et sinon déclarer l'exception.
- **Licence du papier** : une licence CC BY sur le texte (`FAITS-arxiv-ssrn-2026-09-24.md`, licences arXiv [lu-orch] : « allows for commercial use ») accorderait la réutilisation commerciale de tout ce que le papier contient [analyse] : raison de plus pour qu'aucun niveau sous licence n'y figure, fichiers auxiliaires compris.

### 4.4 Ce que je n'ai pas pu confirmer, et où j'ai cherché (§4)

- Le texte de l'avis juriste et des conditions de licence : **non ouverts, volontairement** (mission : ne pas relire les conditions des fournisseurs ; le détail de la décision 165 est confidentiel hors dépôt).
- Si le gate de vocabulaire et le test racine « aucun nom de fournisseur » couvriront un fichier `docs/paper/**` ou un source TeX : non vérifié (`vocab-banned.json` et la liste d'export non lus dans cette passe ; à trancher au G0 du papier).
- Si la publication d'un **VWAP on-chain de session** dans un papier (niveau dérivé de données publiques du registre) pose une question de licence : aucune règle du dépôt ne l'interdit (4-e : il est porté par le digest) ; seule la combinaison avec g soulève la dérivabilité (4.3).

---

## 1. SSRN : règles de dépôt (lu entre 2026-09-24T16:52:26Z et 16:59:07Z ; section écrite à 2026-09-24T17:00:48Z)

**Canal** : `https://service.elsevier.com/app/home/supporthub/ssrn/` répond **308** vers `https://www.elsevier.support/ssrn` (WebFetch, vers 16:52Z) ; c'est la raison pour laquelle les URL devinées de l'orchestrateur tombaient sur l'accueil Elsevier (FAITS, section SSRN). Le GET direct par curl sur `service.elsevier.com` échoue à 16:52:26Z sur `CRYPT_E_REVOCATION_OFFLINE` (serveur de révocation du certificat injoignable) : **non contourné** (aucune option `--ssl-no-revoke`). Toutes les pages ci-dessous ont été lues sur `www.elsevier.support` et `www.ssrn.com` (HTTP 200, GET curl, texte extrait sans les scripts ; les libellés de lien « opens in new tab/window » insérés dans les phrases sont remplacés par […]). Niveau **[lu-curl]**, classe **P1** (centre d'aide et conditions de l'opérateur). Chaque page porte « All rights are reserved, including those for text and data mining » : seules des citations courtes sont reprises ; les copies de travail du scratchpad sont supprimées en fin de passe.

### 1.1 Articles lus (URL exactes, heure du GET, date de mise à jour affichée)

| Article (titre affiché) | URL | GET (UTC) | « Last updated » |
|---|---|---|---|
| What are SSRN's submission guidelines? | `https://www.elsevier.support/ssrn/answer/get-started` | 16:53:33Z | August 03, 2026 |
| How long does SSRN's review process take? | `https://www.elsevier.support/ssrn/answer/ssrn-review-process` | 16:53:35Z | July 20, 2026 |
| What is SSRN's copyright policy and where can I find more information? | `https://www.elsevier.support/ssrn/answer/copyright-policy` | 16:53:38Z | August 03, 2026 |
| Introducing the NEW SSRN Submission Form (News) | `https://www.elsevier.support/ssrn/news/submission-form` | 16:53:41Z | May 28, 2024 |
| What is SSRN? | `https://www.elsevier.support/ssrn/answer/what-is-ssrn` | 16:53:44Z | August 03, 2026 |
| Welcome to SSRN, Elsevier's Preprint Server (News) | `https://www.elsevier.support/ssrn/news/welcome-to-ssrn-elseviers-preprint-server` | 16:53:46Z | August 03, 2026 |
| How do I remove my paper from SSRN? | `https://www.elsevier.support/ssrn/answer/remove-my-paper` | 16:53:51Z | August 03, 2026 |
| How does SSRN's classification and distribution process work? | `https://www.elsevier.support/ssrn/answer/classification-distribution` | 16:55:21Z | August 03, 2026 |
| What is a DOI and how does it help my research? | `https://www.elsevier.support/ssrn/answer/doi` | 16:55:25Z | August 03, 2026 |
| How do I add authors to my submission? | `https://www.elsevier.support/ssrn/answer/adding-authors` | 16:55:29Z | August 03, 2026 |
| Is SSRN a publisher? | `https://www.elsevier.support/ssrn/answer/is-ssrn-a-publisher` | 16:55:33Z | August 03, 2026 |
| Why is my paper non-scholarly or non-research? | `https://www.elsevier.support/ssrn/answer/nonscholarly` | 16:56:27Z | August 03, 2026 |
| How has research integrity impacted preprints on SSRN? | `https://www.elsevier.support/ssrn/answer/research-integrity` | 16:56:30Z | February 25, 2026 |
| SSRN Terms of Use | `https://www.ssrn.com/index.cfm/en/terms-of-use/` | 16:56:50Z | « Last updated June 2017 » |
| Getting Started document du nouveau formulaire (PDF d'aide en accès libre, lié depuis la page News) | `https://supportcontent.elsevier.com/Support%20Hub/SSRN/SSRN_NewSubmissionForm.pdf` | 16:57:48Z (1 012 015 o, sha256 `1ac06504940b366087f2ac35402f064f05777cf756983b0de810a02a98ab052a`) | non imprimée dans le texte extrait |
| Financial Economics Network (FEN) | `https://www.ssrn.com/index.cfm/en/fen/` | 16:58:18Z | — |
| FEN eJournal Offerings (taxonomie des alertes) | `https://www.ssrn.com/index.cfm/en/fen/fen-ejournals/` | 16:58:24Z | — |
| CompSciRN, ERN, LSN eJournal Offerings | `https://www.ssrn.com/index.cfm/en/{compscirn,ern,lsn}/{…}-ejournals/` | 16:58:52Z à 16:59:07Z | — |

### 1.2 Règles, par question de la mission

| Question | Réponse | Verbatim (≤ 25 mots) | Source |
|---|---|---|---|
| **Compte** | Compte utilisateur gratuit avec profil d'auteur complet, requis pour déposer. | « A free SSRN User Account […] with a complete author profile […] is required to submit a paper. » | get-started, 16:53:33Z |
| **Frais** | Aucun frais de dépôt ni de distribution par alertes. | « There is no fee for submitting abstracts or papers for inclusion in the SSRN corpus or for distribution via email alerts. » | classification-distribution, 16:55:21Z |
| | Confirmé par la page de présentation. | « enables authors to post their papers and abstracts easily and free of charge » | what-is-ssrn, 16:53:44Z |
| | DOI payé par SSRN. | « automatically assigns a preprint DOI to qualifying papers at no cost to authors » | doi, 16:55:25Z |
| **Endossement** | **Aucune mention** d'un endossement dans les 14 pages d'aide lues ni dans le PDF d'aide (`grep -i endors` : 0 occurrence dans les pages d'aide ; dans les conditions d'usage, le mot n'apparaît que pour les liens vers le site). L'absence est constatée sur ces pages, pas prouvée pour tout le service. | — | toutes pages du 1.1 |
| **Affiliation** | Affiliation courante et e-mail valide exigés pour **tous** les auteurs ; PDF avec titre, auteurs et affiliations ; une organisation ne peut pas être auteur (sauf organisations gouvernementales ou académiques). | « Names, current affiliations, and valid email addresses of all authors » ; « Organizations cannot be listed as authors (exceptions are government- or academic-related organizations) » | get-started, 16:53:33Z |
| | Le PDF doit porter titre, auteurs, affiliations. | « Full-text PDF must be in English […] and display the title and all authors with their affiliations » | get-started |
| | Champs de l'étape 3 du formulaire : Name, Email, **Institution**, ORCID, Affiliation Role. | « Institution - The name of the institution the author is associated with. » | PDF d'aide, étape 3 |
| **Auteur indépendant** | **NON TROUVÉ** : aucune page lue ne traite l'auteur sans institution, ni ne dit si une entreprise (« MONARK ») est une affiliation acceptée. La règle « organisation comme auteur » ne vise pas le cas (l'auteur est une personne). | — | get-started, adding-authors, PDF d'aide |
| **Éligibilité du contenu** | Recherche à méthodologie rigoureuse et résultats originaux ; refus typiques qui touchent un papier de méthode d'une entreprise : « Frameworks », « Guides and how to's », articles non savants, dont certains contenus commerciaux ou marketing. | « SSRN accepts studies with rigorous methodology and original findings, meeting our posting standards. » ; « Articles with no references, some commercial/marketing material » | get-started |
| | Critère « savant » : présence de références. | « The presence of citations, references, footnotes, or endnotes is a key indicator of scholarly work. » | nonscholarly, 16:56:27Z |
| **Refus** | Décision finale, sans motif individuel ni appel. | « Rejection decisions are final. » ; « SSRN does not reconsider decisions to reject submissions. » | get-started |
| **IA** | Déclaration d'usage de l'IA obligatoire si l'IA est utilisée, avec le résumé et sur le PDF ; contrôles d'intégrité visant l'IA non déclarée et l'IA comme auteur. | « AI disclosure statement must be included with the abstract and display on the PDF » ; « AI usage with no disclosure statement » ; « AI and AI technologies as an author » | get-started ; research-integrity, 16:56:30Z |
| | Volume et IA non déclarée : risque de refus et de fermeture de compte. | « Undisclosed substantial AI use and high submission volumes may lead to rejections and account closure. » | get-started |
| **Conflits d'intérêts** | Étape 5 : déclarations de financement et de conflit d'intérêts **recommandées** pour la recherche non médicale ; publiées sous le résumé. | « For non-medical research, funding and conflict of interest statements are recommended. » | PDF d'aide, étape 5 |
| | La revue peut vérifier les intérêts concurrents et l'identité des auteurs. | « Verification Processes: Verify any competing interests and confirm author identities. » | ssrn-review-process |
| **Délai de revue** | Jusqu'à 10 jours ouvrés pour certains dépôts. | « Most submissions are processed quickly, though some may take up to 10 business days. » | ssrn-review-process, 16:53:35Z |
| **Délai de DOI** | Quelques jours ouvrés après la revue ; DOI réservé aux dépôts publiés avec PDF complet ; DOI permanent. | « DOI assignment typically occurs within a few business days after the review process has been completed. » ; « Once a DOI is assigned, it becomes a permanent record of that preprint. » | doi |
| **Distribution (réseaux)** | Classification par l'auteur, 1 à 7 classifications ; inclusion dans les alertes curatée, non garantie ; jusqu'à 45 jours pour les sujets chargés ; papier écrit dans l'année. | « Authors can select at least one classification, up to a maximum of seven. » ; « Inclusion is curated and targeted, not guaranteed for every paper. » ; « may take up to 45 days » | classification-distribution |
| **JEL** | Facultatif, sans effet sur la distribution. | « The JEL Code section in the submission form is completely optional and does not impact distribution. » | classification-distribution ; même phrase au PDF d'aide |
| **FEN** | Réseau de préprints en économie financière, en accès libre. | « The Financial Economics Network on SSRN is an open access preprint server » | FEN, 16:58:18Z |
| | Sujets d'alerte FEN pertinents (liste lue) : « Capital Markets: Market Microstructure », « Cryptocurrency Research », « Derivatives », « Regulation of Financial Institutions », « Risk Management ». | (intitulés de liste) | FEN eJournal Offerings, 16:58:24Z |
| **FinTech** | **NON TROUVÉ** : aucun intitulé « FinTech » dans les listes FEN, CompSciRN, ERN, LSN lues ; voisins trouvés : « Cybersecurity, Privacy, & Networks » (CompSciRN), « Smart Contracts & Legal Aspects of Blockchain » (LSN). Les intitulés du formulaire (arbre de classification de l'étape 4) n'ont pas été vus (compte requis : non ouvert). | — | listes d'eJournals, 16:58:52Z à 16:59:07Z |
| **Format** | PDF seul. | « NOTE: Only PDFs are accepted. » | PDF d'aide, étape 1 |
| **Copyright** | Pas de cession ; droit non exclusif de publier et distribuer ; retrait possible à tout moment. | « You do not transfer copyright for any papers (or other documents) you post on SSRN. » ; « you give SSRN the non-exclusive right to post and distribute your paper » | copyright-policy, 16:53:38Z |
| **Licence consentie à l'opérateur** | Licence non exclusive, gratuite, perpétuelle, mondiale, révocable, pour les services (copier, distribuer, traduire, reformater…). | « you grant Elsevier a non-exclusive, royalty-free, perpetual, worldwide, revocable license to use your content in connection with the Services » | Terms of Use (juin 2017), 16:56:50Z |
| **Licence au lecteur (CC)** | **NON TROUVÉ** : aucun choix de licence Creative Commons dans le PDF d'aide du formulaire (`grep -i "licen\|creative"` : 0) ni dans les pages d'aide lues. Les conditions d'usage réservent les services à un usage « personal, non-commercial, informational or scholarly », sauf contenu en accès ouvert soumis à sa propre licence. | « The Services are provided solely for personal, non-commercial, informational or scholarly use. » | Terms of Use |
| **Retrait** | Retrait possible (statut « REMOVED ») ; mais un DOI attribué ne s'efface pas ; un papier retiré redirige vers un avis. | « If a paper is retracted or withdrawn, its DOI will redirect to a retraction or withdrawal notice on SSRN's website. » | doi ; remove-my-paper |
| **Double dépôt (arXiv + SSRN)** | Permis (l'auteur garde le copyright) ; mise en garde : métriques diluées, confusion de DOI. | « You hold the copyright to your manuscript and are free to post it to other sites » | welcome (FAQ First Look), 16:53:46Z |
| **Statut** | Pas un éditeur ; pas de relecture par les pairs. | « We are not a peer-reviewed journal » | is-ssrn-a-publisher, 16:55:33Z |

### 1.3 Conséquences pour MONARK ([analyse] du chercheur, à trancher par l'investisseur)

- **Pas d'endossement, pas de frais** sur SSRN (sur les pages lues), contrairement à arXiv (§2) : SSRN est la plateforme accessible sans tiers.
- **Risque d'éligibilité** : un papier d'infrastructure écrit par le fondateur d'une entreprise sur son produit touche deux motifs de refus listés (« Frameworks », contenu commercial) et le refus est final, sans appel. Parades : références abondantes (critère « savant »), résultats mesurés et limites déclarées, déclaration de conflit d'intérêts à l'étape 5, aucun appel commercial.
- **Affiliation** : « MONARK » comme institution n'est ni autorisée ni interdite par les pages lues ; la personne est l'auteur (règle « organisation comme auteur » non touchée).
- **Déclaration IA obligatoire** (sur le PDF et avec le résumé) : le dépôt MONARK est produit avec des agents ; la formulation de cette déclaration est une décision investisseur (et une contrainte de rédaction, §5).
- **Licence** : SSRN n'offre pas (d'après les pages lues) de choix CC ; une mention de licence imprimée sur le PDF est une hypothèse non confirmée.

### 1.4 Ce que je n'ai pas pu confirmer, et où j'ai cherché (§1)

- **Auteur indépendant / affiliation d'entreprise** : cherché dans get-started, adding-authors, PDF d'aide (étape 3), research-integrity : rien. Procurement formé P-1 (§8).
- **Licence CC au choix de l'auteur** : cherché dans le PDF d'aide, copyright-policy, Terms of Use : rien. Le « Copyright Reference Guide » lié depuis copyright-policy n'a pas été ouvert (lien non suivi, hors liste). Procurement P-2 (§8).
- **Intitulés exacts de l'arbre de classification** (étape 4, derrière compte) : non vus ; seules les listes publiques d'alertes ont été lues. Aucun intitulé « FinTech » trouvé (FEN, CompSciRN, ERN, LSN).
- **Délai de mise en ligne** : seul « up to 10 business days » (revue) et « a few business days » (DOI) sont écrits ; aucune durée garantie.
- `service.elsevier.com` par curl : échec de vérification de révocation, non contourné ; les mêmes articles ont été lus sur l'hôte de redirection.
- Incident consigné : un WebFetch sur le PDF d'aide (vers 16:57:2xZ) a déposé automatiquement une copie binaire du PDF sous `C:\Users\KACIMI\.claude\projects\…\tool-results\` ; supprimée à 16:57:41Z avec deux sorties persistées de cette passe (contrainte « rien sur C: »). Le PDF a ensuite été lu en texte sur F: puis supprimé.

---

## 2. arXiv : catégorie cible et endosseurs (lu entre 2026-09-24T17:00:57Z et 17:18:08Z ; section écrite à 2026-09-24T17:19:53Z)

**Canal et règles d'accès** : `https://arxiv.org/robots.txt` lu à 17:00:57Z avant tout GET automatisé : « Crawl-delay: 15 » ; `Allow: /abs`, `/archive`, `/list` ; `Disallow: /search`, `/api`, `/auth`. Conséquences appliquées : aucun GET sur `/search` ni `/api` (la découverte des papiers est passée par WebSearch, moteur tiers) ; pages `/abs` et `/list` espacées d'au moins 15 s ; le lien des endosseurs vit sous `/auth/show-endorsers/…` (chemin interdit aux robots) : **jamais suivi**, seule sa présence dans le HTML de la page d'abstract est notée. Plusieurs GET vers `arxiv.org` ont d'abord échoué par délai de connexion (17:01:11Z, 17:01:53Z, 17:02:55Z, 17:09:49Z) puis abouti au ré-essai ; aucun contournement. Niveau des pages d'aide et de taxonomie : **[lu-curl]**, classe P1. Niveau des papiers : **[abs]** (page d'abstract seule, aucun PDF ouvert).

### 2.1 Définitions officielles des catégories candidates

Source : `https://arxiv.org/category_taxonomy`, GET lancé à 17:01:53Z (succès au ré-essai), texte identique sur `https://arxiv.org/archive/q-fin` (GET lancé à 17:02:55Z, succès au ré-essai ; en-tête « Quantitative Finance (since December 2008) »). Verbatim :

| Catégorie | Définition officielle (verbatim) | Adéquation au papier ([analyse]) |
|---|---|---|
| **q-fin.TR** Trading and Market Microstructure | « Market microstructure, liquidity, exchange and auction design, automated trading, agent-based modeling and market-making » | Mesure de l'écart de prix de session et du ratio de volume dans des pools AMM hors séance : microstructure et liquidité. **Candidat principal.** Catégorie primaire de 4 des 14 papiers proches relevés (2.3). |
| **q-fin.ST** Statistical Finance | « Statistical, econometric and econophysics analyses with applications to financial markets and economic data » | Parts de sessions au-delà d'un seuil, calibration conforme, abstention : statistique appliquée. Candidat principal alternatif ou cross-list. |
| **q-fin.GN** General Finance | « Development of general quantitative methodologies with applications in finance » | Colle au mot « méthode » du titre ; catégorie primaire de 2 papiers proches (2508.11651, 2604.13458). Candidat si l'accent est mis sur la méthode plutôt que sur la mesure. |
| **cs.CR** Cryptography and Security | « Covers all areas of cryptography and security including authentication, public key cryptosytems, proof-carrying code, etc. » [sic] | Chaîne signée Ed25519, digests chaînés, ancrage OpenTimestamps : authentification et intégrité. **Cross-list**, pas primaire (le cœur du papier est une mesure financière). |
| q-fin.RM Risk Management | « Measurement and management of financial risks in trading, banking, insurance, corporate and other applications » | Faible (pas de gestion du risque). |
| q-fin.CP Computational Finance | « Computational methods, including Monte Carlo, PDE, lattice and other numerical methods with applications to financial modeling » | Faible. |
| cs.CE Computational Engineering, Finance, and Science | « Covers applications of computer science to the mathematical modeling of complex systems in the fields of science, engineering, and finance. » | Constat : catégorie primaire de 3 papiers de tokenisation relevés (2606.13822, 2606.01131, 2606.07442). Alternative si l'investisseur préfère un domaine d'endossement « cs ». |
| stat.ME Methodology | « Design, Surveys, Model Selection, Multiple Testing, Multivariate Methods, Signal and Image Processing, Time Series, Smoothing, Spatial Statistics, Survival Analysis, Nonparametric and Semiparametric Methods » | Seulement si une contribution conforme méthodologique est revendiquée (ce n'est pas l'objet du papier de mesure). |

**Règles de cross-list** (`https://info.arxiv.org/help/cross.html`, GET 17:03:58Z, [lu-curl]) : « It is rarely appropriate to add more than one or two cross-lists. » ; « Bad cross-lists will be removed. » Politique de modération (`https://info.arxiv.org/help/moderation/index.html`, GET 17:04:08Z) : « Cross-lists may be added to other related categories, or they may be removed by moderators when the classification is deemed inappropriate. »

**Proposition** ([analyse], décision investisseur) : primaire **q-fin.TR**, cross-list **cs.CR** (une seule), éventuellement **q-fin.ST** en seconde cross-list ; ne pas dépasser deux.

### 2.2 Endossement : ce qui s'ajoute aux FAITS de l'orchestrateur

Relu sur `https://info.arxiv.org/help/endorsement.html` (GET 17:03:39Z, [lu-curl]) ; les faits des FAITS (`[lu-orch]`, 16:37:30Z) sont confirmés mot pour mot (exigence d'endossement, voies institutionnelle et personnelle, « At least one positive endorsement is required per endorsement category », papiers comptés « submitted between three months and five years ago », « not peer review », confidentialité, interdiction d'écrire en masse). Ajouts :

- **Domaines d'endossement** : « most high-level subject areas (e.g., hep-th, cond-mat, q-bio) are currently endorsement domains, with the notable exception of physics ». q-fin n'est pas cité nommément : que **q-fin entier** soit un domaine unique (un endosseur q-fin.ST valant pour q-fin.TR) est une **inférence** [analyse], non confirmée.
- **Voie institutionnelle** : e-mail institutionnel ET propriété revendiquée d'un papier co-écrit. MONARK n'a ni l'un ni l'autre d'après les faits connus : **voie personnelle seule** (FAITS, conséquence de l'orchestrateur, confirmée).
- **Tiers** : « Only provide endorsement to authors seeking to submit their own work, not to third-parties or proxies. » L'auteur (Stan E Malone) doit demander lui-même, sous son propre compte.
- **Cross-list et endossement** : **NON TROUVÉ**. Ni `endorsement.html`, ni `cross.html`, ni la politique de modération ne disent si une cross-list vers un second domaine (cs.CR) exige un second endossement. La cross-list se fait « using the cross-list facility on your user page » (`cross.html`). Demande de consultation C-2 (§9) et procurement P-4 (§8).
- **Effet de la règle des trois mois** [analyse] : un papier soumis il y a moins de trois mois ne compte pas pour son auteur ; les papiers d'août et septembre 2026 ci-dessous (2608.09188 : v1 du 10 août 2026 ; 2609.15797 et 2609.12582 : septembre 2026) ne qualifient pas encore leurs auteurs **par eux-mêmes** (ils peuvent l'être par d'autres papiers).
- **Politique IA** (modération, 17:04:08Z) : « generative AI language tools should not be listed as an author » ; les auteurs « each individually take full responsibility for all its contents, irrespective of how the contents were generated » (extrait) ; l'usage significatif d'IA générative texte-à-texte est à déclarer selon les normes de méthodologie du domaine.
- **Modération** : « Material submitted to arXiv is expected to be self-contained and of interest, relevance, and value to the disciplines we serve. » ; refus possible pour manque d'originalité, de nouveauté ou de portée.

### 2.3 Papiers arXiv proches (2024-2026), relevés sur leur page d'abstract

Découverte par WebSearch (domaine `arxiv.org`, requêtes : tokenized stocks/equities, RWA tokenization, stablecoin peg deviation, DEX/AMM microstructure, overnight/24-hour trading, conformal prediction in finance, selective/Mondrian conformal, verifiable provenance/timestamping), puis une page de liste autorisée (`https://arxiv.org/list/q-fin.TR/2026-08?skip=0&show=250`, GET 17:05:12Z). Chaque ligne : GET de `https://arxiv.org/abs/<id>` (heure dans la colonne), champs lus dans les métadonnées de la page (`citation_title`, `citation_author`, historique des versions, sujet primaire, sujets). **Lien « Which authors of this paper are endorsers? »** : présent sur les 14 pages (recherche de `show-endorsers` dans le HTML brut), **non suivi**. Aucune adresse e-mail relevée.

| # | arXiv | Titre | Auteurs | v1 (UTC) | Primaire ; cross-lists | Pourquoi proche ([abs]) | GET | Lien endosseurs |
|---|---|---|---|---|---|---|---|---|
| 1 | 2608.09188 | When Cross-Venue Agreement Is Not Price Discovery: Disclosure Frontiers for 24/7 Equity-Perpetual Oracles | Donghwa Seo, Doohwi Cha, Seunghan Son, Juyeong Lee, Minjae Lee, Minsuk Sung | 10 Aug 2026 | q-fin.TR | équité cotée hors séance du marché primaire ; marque en fenêtre fermée : « Crypto-listed equity perpetuals trade while the primary cash market is closed » | 17:05:58Z | présent |
| 2 | 2609.15797 | A prelude to the theory of Real-World Asset (RWA) Tokenization | Wenpin Tang | 14 Sep 2026 | econ.GN | théorie économique de la tokenisation RWA (le résumé ne mentionne pas les actions ; la mention d'actions publiques tokenisées transférables au-delà des heures d'échange vient de la synthèse WebSearch du texte HTML intégral, formulation non vérifiée, texte non lu : [2nd]) | 17:06:15Z | présent |
| 3 | 2606.13822 | Price-Discovery Admissibility in Tokenized Fixed Income: Identification, Affine Characterization, and the Structure of the Token-to-Fiat Mapping | Artem Alkhamov, Boris Kriuk | 11 Jun 2026 | cs.CE | enveloppe on-chain contre sous-jacent off-chain : « lives on two ledgers » | 17:08:02Z | présent |
| 4 | 2606.01131 | Tokenized but Illiquid? Evidence from Real-World Asset Markets | Rischan Mafrur | 31 May 2026 (v2 17 Jul 2026) | cs.CE ; q-fin.CP | liquidité observée des RWA tokenisés ; DOI de publication `10.3390/fintech5030062` affiché | 17:06:32Z | présent |
| 5 | 2508.11651 | Tokenize Everything, But Can You Sell It? RWA Liquidity Challenges and the Road Ahead | Rischan Mafrur | 3 Aug 2025 | q-fin.GN ; cs.CR, q-fin.CP | liquidité des RWA ; exemple de combinaison q-fin primaire + cs.CR | 17:08:19Z | présent |
| 6 | 2606.07442 | Tracing Stablecoin Contagion during the USDC Depeg after the Silicon Valley Bank Collapse | Krongtum Sankaewtong, Stefan Kitzler, Bernhard Haslhofer, Yuichi Ikeda | 5 Jun 2026 (v2 11 Jun 2026) | cs.CE | dépeg de l'USDC ; résumé : « we analyze high-granularity transaction data » (activité on-chain) | 17:18:08Z (1er essai 17:09:49Z en échec) | présent |
| 7 | 2601.18991 | Who Restores the Peg? A Mean-Field Game Approach to Model Stablecoin Market Dynamics | Hardhik Mohanty, Bhaskar Krishnamachari | 26 Jan 2026 (v2 7 May 2026) | q-fin.TR ; cs.GT, econ.GN | mécanismes de retour au peg (arbitrage) | 17:11:40Z | présent |
| 8 | 2506.08718 | Price Discovery in Cryptocurrency Markets | Juan Plazuelo Pascual, Carlos Tardon Rubio, Juan Toro Cebada, Angel Hernando Veciana | 10 Jun 2025 | q-fin.TR | découverte des prix CEX contre DEX | 17:11:56Z | présent |
| 9 | 2410.19107 | What Drives Liquidity on Decentralized Exchanges? Evidence from the Uniswap Protocol | Brian Z. Zhu, Dingyue Liu, Xin Wan, Gordon Liao, Ciamac C. Moallemi, Brad Bachu | 24 Oct 2024 (v2 17 Jan 2025) | q-fin.TR | microstructure des pools AMM (profondeur, concentration de liquidité) | 17:12:13Z | présent |
| 10 | 2605.17705 | Online Conformal Prediction for Non-Exchangeable Panel Data | Daohong Tu, Kay Giesecke | 18 May 2026 | stat.ML ; cs.LG, stat.ME | conforme sans échangeabilité (dépendance temporelle, hétérogénéité) | 17:13:07Z | présent |
| 11 | 2602.10018 | Online Selective Conformal Prediction with Asymmetric Rules: A Permutation Test Approach | Mingyi Zheng, Ying Jin | 10 Feb 2026 | stat.ME ; math.ST, stat.ML | conforme sélectif ; résumé : « PErmutation-based Mondrian Conformal Inference (PEMI) » | 17:16:40Z | présent |
| 12 | 2609.12582 | NovaFabric: Tamper-Evident, Replayable Evidence for Autonomous AI Agent Runs | Mohsen Seyedkazemi Ardebili | 11 Sep 2026 | cs.CR ; cs.DC | preuves inviolables et rejouables ; résumé : « sealed with a holistic DSSE signature, RFC 3161 timestamp, Merkle log and redaction attestation » | 17:14:53Z | présent |
| (13) | 2603.13252 | When Alpha Breaks: Two-Level Uncertainty for Safe Deployment of Cross-Sectional Stock Rankers | Ursina Sanderink | 24 Feb 2026 | cs.AI ; cs.LG, q-fin.PM | abstention en finance (« regime trust gate ») ; hors liste principale | 17:13:23Z | présent |
| (14) | 2604.13458 | Interpretable Systematic Risk around the Clock | Songrun He | 15 Apr 2026 | q-fin.GN ; q-fin.PM, q-fin.RM | risque systématique « around the clock » (hors séance) ; hors liste principale | 17:15:47Z | présent |

**Réservoir d'endosseurs potentiels** ([analyse], noms seulement, personne n'a été contacté) : les auteurs des papiers à primaire q-fin (lignes 1, 5, 7, 8, 9, 14) sont dans le domaine visé si q-fin est un domaine unique (inférence 2.2) ; seuls ceux que le lien `/auth/show-endorsers/` désignerait sont éligibles, et ce lien n'a pas été suivi (chemin interdit aux robots, et la mission l'exclut). Pour cs.CR : ligne 12 (primaire) et ligne 5 (cross-list). La procédure arXiv prévoit que l'auteur ouvre d'abord une soumission dans la catégorie, reçoit le code d'endossement, puis cherche l'endosseur parmi les auteurs des papiers qu'il cite : **acte de compte, hors mandat du chercheur**.

### 2.4 Ce que je n'ai pas pu confirmer, et où j'ai cherché (§2)

- **Endossement d'une cross-list** : cherché dans `endorsement.html`, `cross.html`, `moderation/index.html`, `submit/index.html` : rien. P-4, C-2.
- **q-fin comme domaine d'endossement unique** : la page ne cite que des exemples (hep-th, cond-mat, q-bio) : inférence non confirmée. P-4.
- **Qui est endosseur** parmi les auteurs listés : non établi (lien non suivi, par règle).
- **Cong et al. sur arXiv** : l'orchestrateur note son absence (FAITS) ; non re-vérifié par recherche arXiv (`/search` interdit aux robots) ; voir §3 pour la vérification par moteur de recherche.
- **Papiers « tokenized stocks » stricto sensu sur arXiv** : aucune page d'abstract trouvée dont le titre porte « tokenized stocks » ou « tokenized equities » ; le plus proche est 2608.09188 (perpétuels sur actions, fenêtre fermée) et 2609.15797 (théorie RWA, actions publiques). Recherches faites : WebSearch domaine `arxiv.org` (« tokenized stocks », « tokenized equities », « xStocks », « tokenized equity premium discount ») ; liste q-fin.TR d'août 2026. L'absence n'est pas prouvée (moteur tiers, `/search` non utilisé).
- Mentions des résumés de recherche WebSearch (ex. chiffres de marché des RWA) : **non reprises** (P3, et chiffres de marché exclus du papier, §4.2 point 11).

---

## 5. Format, gabarit et plan de papier (lu entre 2026-09-24T17:16:26Z et 17:20:39Z ; section écrite à 2026-09-24T17:22:57Z)

### 5.1 arXiv : exigences de soumission ([lu-curl], P1)

| Exigence | Verbatim (≤ 25 mots) | Source (GET UTC) |
|---|---|---|
| Gratuité | « While submission to arXiv is free for authors » | `https://info.arxiv.org/help/submit/index.html` (17:16:26Z) |
| Nature | « Submissions to arXiv should be topical and refereeable scientific contributions that follow accepted standards of scholarly communication. » | idem |
| Auteurs enregistrés, endossement | soumissions réservées aux auteurs enregistrés ; « If you are a new user or are submitting to a new category, you may be required to find endorsements. » | idem |
| Licence à arXiv | « Authors must grant arXiv.org an irrevocable license to distribute the work. » | idem |
| Calendrier d'annonce | « New submissions received by 14:00 (Eastern Daylight/Standard Time Zone) are generally made available at 20:00 (Eastern) » | idem |
| Formats acceptés | « (La)TeX, AMS(La)TeX, PDFLaTeX » ; « PDF » ; « HTML with JPEG/PNG/GIF images » | idem |
| **TeX préféré** | « Currently, the best choice is TeX/LaTeX. » | idem |
| **PDF issu de TeX refusé** | « We do not accept dvi, PS, or PDF created from TeX/LaTeX source » ; page PDF : « a PDF file created from a TeX/LaTeX file will typically be rejected, with exceptions granted on a case-by-case basis. » | idem ; `https://info.arxiv.org/help/submit_pdf.html` (17:16:36Z) |
| PDF accepté (non issu de TeX) | « Submit one PDF file including all text and figures. » ; polices incluses, contours TrueType/Type1 plutôt que Type3 bitmap. | submit_pdf (17:16:36Z) |
| Figures | « We do not accept submissions with omitted figures, even if you provide links to view figures externally. » | submit/index |
| Bibliographie TeX | « Include .bib or .bbl files if you use BibTeX/Biber » ; réglages de conversion par un fichier `00README` ; version de TeX Live d'arXiv documentée à part. | `https://info.arxiv.org/help/submit_tex.html` (17:16:31Z) |
| **Fichiers auxiliaires** | « the ancillary files feature is not supported with PDF submissions at this time. They are only supported for submissions with TeX/PDFLaTeX source files. » | `https://info.arxiv.org/help/ancillary_files.html` (17:16:41Z) |
| Contenu auxiliaire admis | données brutes des tables et figures, code, images, tableurs ; répertoire `anc` à la racine de l'archive ; lié à une version, non modifiable indépendamment. | idem |
| Taille | **Aucune limite chiffrée** dans le texte lu : rejet automatique des soumissions surdimensionnées avec identifiant, exception sur demande ; depuis février 2026, avertissement au-delà de 34 mégapixels par image. | `https://info.arxiv.org/help/sizes.html` (17:16:45Z) |
| Métadonnées | champs en ASCII seulement ; « abstracts longer than 1920 characters will not be accepted » | `https://info.arxiv.org/help/prep.html` (17:20:12Z) |
| Affiliation | « Claimed affiliation should be current in the conventional sense: e.g., physical presence, funding, e-mail address, etc. » ; fausse déclaration = suspension possible. | prep.html |
| Anonymat, IA | « Anonymous submissions are not accepted. » ; « Generative AI language tools should not be listed as an author » | prep.html ; moderation (17:04:08Z) |
| Licences offertes | CC BY 4.0 ; CC BY-SA 4.0 ; CC BY-NC-SA 4.0 ; CC BY-NC-ND 4.0 ; « arXiv.org perpetual, non-exclusive license 1.0 » ; CC0. « The license chosen is irrevocable and cannot be changed. » Métadonnées sous CC0 : « A Creative Commons CC0 1.0 Universal Public Domain Dedication will apply to all metadata. » | `https://info.arxiv.org/help/license/index.html` (17:16:50Z) ; complète la lecture tronquée des FAITS |

**Conséquences pour le gabarit** ([analyse]) : écrire en **LaTeX** (pdfLaTeX, figures PDF/PNG), soumettre les **sources** à arXiv (le PDF compilé serait refusé), joindre `.bbl` ; résumé ASCII ≤ 1 920 caractères ; les fichiers auxiliaires (`anc/`) ne sont possibles qu'avec des sources TeX et ne doivent contenir **aucun niveau sous licence** (§4.2 point 2) ni fixture synthétique ressemblant à une vraie preuve (règle C-7 d'`ADR-BELL-OTS-ANCHOR-1.md`, étendue par analogie) ; le même TeX compilé en PDF sert au dépôt SSRN (PDF seul).

### 5.2 SSRN : format (rappel du §1, [lu-curl])

PDF seul (« NOTE: Only PDFs are accepted. ») ; en anglais ; titre, **tous les auteurs et leurs affiliations sur le PDF** ; date de rédaction et résumé requis ; **déclaration IA sur le PDF et avec le résumé** si l'IA est utilisée ; déclarations de financement et de conflit d'intérêts recommandées (étape 5, publiées sous le résumé) ; 1 à 7 classifications ; JEL facultatif (« completely optional and does not impact distribution »). Aucune règle de mise en page (police, gabarit, longueur) trouvée dans les pages lues.

### 5.3 Codes JEL candidats (vérifiés sur la classification de l'AEA)

Source : `https://www.aeaweb.org/econlit/jelCodes.php?view=jel`, GET 17:20:39Z, [lu-curl], P1. Intitulés verbatim :

| Code | Intitulé | Motif ([analyse]) |
|---|---|---|
| G14 | « Information and Market Efficiency • Event Studies • Insider Trading » | écart au dernier close hors séance (loi du prix unique) |
| G12 | « Asset Pricing • Trading Volume • Bond Interest Rates » | ratio de volume |
| G18 | « Government Policy and Regulation » (sous G1 « General Financial Markets ») | contexte de l'exemption TSV et de la lettre 4-927 |
| C58 | « Financial Econometrics » | mesure statistique par régime |
| C81 | « Methodology for Collecting, Estimating, and Organizing Microeconomic Data • Data Access » | collecte on-chain, provenance, rejeu |
| O33 (option) | « Technological Change: Choices and Consequences • Diffusion Processes » | tokenisation |

### 5.4 Plan proposé (12 à 15 pages de corps, annexes en sus)

Titre de travail (décision 200) : *Session-level, signed and replayable measurement of tokenized equity price gaps* ; auteur : Stan E Malone, MONARK (affiliation : décision investisseur, §1.4 et §5.1). Chaque section est rattachée à un artefact déjà servi ou consigné ; les sections de la page `/bell/method` (`apps/site/app/bell/method/page.tsx` : sessions, reference close day, formulas, periods, residuals, digest and chain, public key, anchors, replay code, limits) se reportent presque une à une.

| § | Section | Pages | Contenu et source dans le dépôt | Figures / tables |
|---|---|---|---|---|
| — | Page de titre, résumé (ASCII ≤ 1 920 car.), mots-clés, JEL, **déclaration IA**, **conflit d'intérêts** (MONARK exploite Bell ; relation commerciale : formule de la lettre v4, à re-confirmer à la date), **disponibilité des données** (ce qui est public ; ce que le lecteur apporte sous sa licence) | 1 | lettre v4 §3 (indépendance), méthode `#replay` (« What you bring ») ; §1.2 et §5.1 ci-dessus | — |
| 1 | Introduction : jetons suivant des actions US négociés quand le marché primaire est fermé ; question de mesure (taille et fréquence des écarts au dernier close) ; contribution = une **méthode** et quatre propriétés d'une publication recalculable ; aucune revendication de nouveauté exclusive (§4.2 point 8) | 1,5 | lettre v4 §1-§3 | — |
| 2 | Travaux liés : tokenized stocks, RWA, analogue ETF (prime/décote, création-rachat), écarts au peg, microstructure des DEX, marques hors séance, conforme et Mondrian, option de rejet et prédiction sélective, publication vérifiable (§3 de cette archive) | 1,5 | §2.3 et §3 | — |
| 3 | Cadre et données : population (quatre jetons, pools AMM publics sur Solana, hors cadre TSV) ; fills comptés une fois par signature ; conversion par action par le multiplicateur on-chain m(t) ; historique des multiplicateurs par deux méthodes ; limite de la page complète | 1,5 | lettre v4 §2, §3 (« Recomputable »), §4 ; méthode `#formulas` | **F1** chaîne de données (registre → fills → VWAP par action ; close sous licence du lecteur → g) |
| 4 | Sessions et jour du close de référence : régimes (overnight-weekday, weekend, holiday ; pre, regular, after), jour d'ancrage, calendrier engagé, règle `refCloseDateOf` | 1,5 | méthode `#sessions`, `#refclose` | **F2** frise des sessions (heure de New York, heure d'été par date) |
| 5 | Mesures : VWAP_share, g = ln(VWAP_share / P_close), exceeds(θ) pour θ ∈ {1, 2, 5} %, share(regime, θ), ratio de volume (numérateur on-chain, dénominateur = mois civil précédant la date de session) ; arithmétique entière exacte | 1,5 | méthode `#formulas`, `#periods` ; lettre v4 §2 | **T1** formules et entrées (publiques / sous licence du lecteur), **sans aucune valeur de niveau** |
| 6 | Abstention nommée : liste fermée des résidus, compteurs publiés ; lien avec l'option de rejet et la prédiction sélective ; **conforme : voir la note ci-dessous** | 1 | méthode `#residuals` ; `SOURCES.md` M-9, M-11 | **T2** liste fermée des codes, avec compteurs datés |
| 7 | Intégrité de la publication : octets canoniques, `bell_sha`, journal chaîné, `timeline.jsonl` en ajout seul avec `prev_line_hash` et signature Ed25519, trousseau comme racine de confiance ; ce qu'une signature montre et ne montre pas ; ancres de course (preuves avec enregistrement de bloc, non vérifiées contre un nœud) et ancres de publication (en préparation à la date de la lettre) | 1,5 | méthode `#digest`, `#key`, `#anchors` ; `ADR-BELL-OTS-ANCHOR-1.md` D1, D4-D6 | **F3** structure de chaîne et d'ancre (ligne n → ligne n−1 ; manifeste → preuve → bloc) |
| 8 | Vérification par un tiers et rejeu : les six gestes (résumé ; texte complet en annexe C), protocole de rejeu | 1 | `ADR-BELL-OTS-ANCHOR-1.md` D4 ; méthode `#replay` | — |
| 9 | Résultats descriptifs : sessions par régime, abstentions, parts au-delà de θ **avec leur dénominateur n** ; comparaison **descriptive** à la Table 4 de Cong et al. (valeurs citées avec attribution) | 1,5 | état publié à une date « as of » ; lettre v4 §2 | **T3** parts par régime avec n et abstentions ; **T4** comparaison descriptive ; **F4** (option) distribution de g par régime, sous réserve du §4.3 |
| 10 | Limites déclarées | 0,5 | lettre v4 §4 ; méthode `#limits` | — |
| 11 | Conclusion | 0,5 | — | — |
| — | Références (25 à 35) | 1,5 | §3 | — |
| A | **Annexe A** : la lettre de commentaire à la SEC (File No. 4-927), **version déposée** telle que publiée par la SEC (décision 199 : déposée le 2026-09-24 ; publication attendue sous 3 à 5 jours ouvrés), jamais le brouillon interne | hors corps | `docs/sec-4927/`, item SEC-POSTED-1 | — |
| B | **Annexe B** : protocole de rejeu (entrées, commandes, sorties attendues ; « With the same inputs, every gap and ratio is designed to recompute bit for bit ») | hors corps | méthode `#replay` | — |
| C | **Annexe C** : les six gestes de vérification (commandes standard `sed`/`head`/`sha256sum`, client OpenTimestamps, nœud au choix, vérification de signature séparée) et leurs bornes | hors corps | `ADR-BELL-OTS-ANCHOR-1.md` D4 | — |
| D | Annexe D : schéma servi (fichiers d'état, de provenance, ligne de timeline) | hors corps | méthode `#digest` | — |
| E | Annexe E : déclaration d'usage d'outils d'IA et provenance du texte | hors corps | exigences SSRN (§1.2) et arXiv (§2.2) | — |

**Note sur le conforme** (à trancher, [lu] dépôt) : `SOURCES.md` M-11 consigne que `under_calib` est un concept du lot T-3 avec **0 occurrence** dans `apps/bell/src` ; la classe conforme servie décrite par `ADR-U4b-2b-classe-servie.md` §0-§1.3 (q̂ = statistique d'ordre de rang p = ⌈(n+1)·0,99⌉, strates committées seulement au-delà d'un n minimal, abstention `under_calib` sinon) concerne **un autre produit** (Ukemi), pas Bell. Le papier Bell ne peut donc présenter la prédiction conforme que comme extension annoncée ou comme méthode du portefeuille MONARK, sauf décision contraire ; §3 fournit les références dans les deux cas.

**Préconditions de contenu** ([lu] dépôt, [analyse] pour la conséquence) : (a) le titre dit « replayable » alors que le collecteur n'est pas encore exporté (méthode : « the collector (replay code below) is not exported yet » ; `url_replay` en placeholder « to be exported ») ; (b) les ledgers de fills et l'historique des multiplicateurs sont « to be published » (méthode, carte « What you bring ») ; (c) au 2026-09-24, les sessions publiées comprennent une seule session weekday-overnight pour TSLAx et pour AAPLx et aucune session de week-end (lettre v4 §2) : la table T3 serait presque vide avant la mesure fondatrice ; (d) ancrage des publications en préparation (lettre v4 §3). Chacun de ces points conditionne une phrase du papier ou la date de dépôt (Needs from you).

### 5.5 Ce que je n'ai pas pu confirmer, et où j'ai cherché (§5)

- **Limite de taille arXiv chiffrée** : absente de `sizes.html`, `submit/index.html`, `submit_tex.html`, `ancillary_files.html` (recherche de « MB », « megabyte », « size » dans le texte extrait). Procurement P-5 (§8).
- **Gabarit, police, longueur** exigés par SSRN : aucune règle trouvée dans les pages lues ; SSRN n'impose que PDF, anglais, titre, auteurs, affiliations.
- **Page de titre SSRN** : la seule exigence lue est l'affichage du titre et des auteurs avec affiliations sur le PDF ; aucun modèle officiel trouvé.
- **Traitement arXiv d'un PDF produit par un autre outil que TeX** (Word, Typst, etc.) : seules les règles générales du PDF ont été lues ; non creusé, TeX étant recommandé.
- Les numéros de page et le découpage 12 à 15 pages sont une **proposition** du chercheur, non une exigence d'une plateforme.

---

## 3. Corpus de positionnement (lu entre 2026-09-24T17:23:27Z et 17:37:42Z ; section écrite à 2026-09-24T17:39:04Z)

**Méthode** : identité de chaque référence vérifiée sur un registre primaire (DOI par l'API publique de Crossref, arXiv, RFC Editor, dépôt institutionnel) ; contenu lu sur le résumé quand une page de résumé était accessible sans compte. Conditions d'usage de l'API Crossref **lues avant le premier appel** (`https://www.crossref.org/documentation/retrieve-metadata/rest-api/`, GET 17:23:27Z) : « No sign-up is required to use the REST API » ; « almost none of the metadata is subject to copyright, and you may use it for any purpose » ; appels faits dans le pool public, **sans adresse e-mail**, un toutes les 3 s. Aucun PDF sous droits ouvert.

**Niveaux employés ici** : `[abs]` = résumé primaire lu (page d'abstract arXiv, résumé déposé par l'éditeur chez Crossref, page de l'éditeur, page de dépôt institutionnel ou d'index qui reproduit le résumé de l'éditeur, source nommée) ; `[lu-curl]` = texte primaire lu (RFC, billet d'auteur) ; `[méta]` = **identité seule** (titre, auteurs, revue, année, DOI) vérifiée au registre DOI, contenu **non lu** : ce qu'on lui emprunte se limite à ce que dit son titre ; toute affirmation plus fine exige le procurement P-3 (§8).

### 3.1 Références (15 entrées)

| # | Référence | Identifiant | Ce qu'on lui emprunte (une phrase) | Niveau, source, heure | Verbatim (≤ 25 mots) |
|---|---|---|---|---|---|
| 1 | Lin William Cong, Wayne R. Landsman, Daniel Rabetti, Che Zhang, Wenqi Zhao (2025), « Tokenized Stocks », SSRN Working Paper 5937314 | DOI `10.2139/ssrn.5937314` (type « posted-content », éditeur Elsevier BV, année 2025) | La statistique de la Table 4 (part des observations au-delà d'un seuil d'écart au dernier close), reprise telle quelle et comparée de façon descriptive. | Identité `[méta]` Crossref 17:34:59Z ; **page d'abstract SSRN : HTTP 403 entre 17:32Z et 17:35Z (WebFetch, une seule tentative), non contourné** ; le contenu (Table 4) reste celui lu par le dépôt : `SOURCES.md` Q3-5 à Q3-8 ([lu+img] d'un worker antérieur, non relu ici) | — |
| 2 | Antti Petajisto (2017), « Inefficiencies in the Pricing of Exchange-Traded Funds », *Financial Analysts Journal* 73(1), 24-54 | DOI `10.2469/faj.v73.n1.7` | Analogue du wrapper : un prix de marché peut s'écarter de la valeur du sous-jacent malgré un mécanisme de création-rachat ; bande d'écart mesurée. | `[abs]` par l'index RePEc IDEAS (`https://ideas.repec.org/a/taf/ufajxx/v73y2017i1p24-54.html`, GET 17:37:07Z) ; page éditeur (tandfonline) HTTP 403 vers 17:36Z, non contourné ; identité Crossref 17:23:58Z | « The prices of exchange-traded funds (ETFs) can deviate significantly from their net asset values (NAVs), in spite of the arbitrage mechanism » |
| 3 | Robert F. Engle, Debojyoti Sarkar (2006), « Premiums-Discounts and Exchange Traded Funds », *The Journal of Derivatives* 13(4), 27-45 | DOI `10.3905/jod.2006.635418` | Référence fondatrice sur les primes et décotes des ETF (titre). | `[méta]` Crossref 17:24:06Z ; page ProQuest « openview » (17:37:12Z) : métadonnées seules ; page éditeur : redirection vers un fournisseur d'identité, **non suivie** | — |
| 4 | Stephen A. Berkowitz, Dennis E. Logue, Eugene A. Noser (1988), « The Total Cost of Transactions on the NYSE », *The Journal of Finance* 43(1), 97-112 | DOI `10.1111/j.1540-6261.1988.tb02591.x` | Justification du VWAP comme prix de référence d'une fenêtre, moins biaisé qu'un prix isolé. | `[abs]` résumé déposé par l'éditeur chez Crossref (GET 17:25:37Z) | « The measure is the volume‐weighted average price over the trading day. » ; « less biased than measures that use single prices, such as closes » |
| 5 | Richard K. Lyons, Ganesh Viswanath-Natraj (2023), « What keeps stablecoins stable? », *Journal of International Money and Finance* 131, 102777 (NBER WP 27136, 2020) | DOI `10.1016/j.jimonfin.2022.102777` ; NBER `10.3386/w27136` | Analogue du peg : l'écart d'un jeton à sa référence et l'arbitrage qui le borne. | `[abs]` page NBER (`https://www.nber.org/papers/w27136`, GET 17:32:23Z) ; identité Crossref 17:24:29Z | « we examine how peg-sustaining arbitrage stabilizes the price » |
| 6 | Vladimir Vovk, Alexander Gammerman, Glenn Shafer (2022), *Algorithmic Learning in a Random World*, 2ᵉ éd., Springer | DOI `10.1007/978-3-031-06649-8` | Cadre de la prédiction conforme et de l'échangeabilité ; prédicteurs de Mondrian (validité conditionnelle par catégorie). | `[méta]` Crossref 17:24:48Z ; page Springer : HTTP 303 sans corps (17:34:16Z), WebFetch : connexion refusée ; contenu non lu | — |
| 7 | Vladimir Vovk, David Lindsay, Ilia Nouretdinov, Alex Gammerman (2003), « Mondrian Confidence Machine », On-line Compression Modelling project, Working Paper 4 | pas de DOI ; notice du dépôt institutionnel `https://pure.royalholloway.ac.uk/en/publications/mondrian-confidence-machine/` | Origine du découpage « Mondrian » (validité par type d'exemple), à citer pour les strates. | `[lu-curl]` **notice seule** (17:36:18Z : « Research output: Working paper », « Published - Mar 2003 ») ; aucun résumé sur la notice ; la description du principe vue dans une synthèse WebSearch est `[2nd]` | — |
| 8 | Anastasios N. Angelopoulos, Stephen Bates, « A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification », arXiv 2107.07511 (v1 15 Jul 2021) ; version publiée *Foundations and Trends in Machine Learning* 16(4), 494-591 (2023) | arXiv `2107.07511` ; DOI `10.1561/2200000101` | Présentation de référence de la validité sans hypothèse de loi (conforme « split ») pour un lecteur finance. | `[abs]` arXiv (GET 17:26:27Z) ; résumé FnT déposé chez Crossref (17:26:04Z) | « the sets are valid in a distribution-free sense: they possess explicit, non-asymptotic guarantees even without distributional assumptions or model assumptions » |
| 9 | Rina Foygel Barber, Emmanuel J. Candès, Aaditya Ramdas, Ryan J. Tibshirani (2023), « Conformal prediction beyond exchangeability », *The Annals of Statistics* 51(2) | arXiv `2202.13415` ; DOI `10.1214/23-AOS2276` | Limite déclarée : la validité conforme repose sur l'échangeabilité, violée par la dérive temporelle (cas des sessions successives). | `[abs]` arXiv (GET 17:27:21Z) ; identité Crossref 17:24:23Z | « Its validity relies on the assumptions of exchangeability of the data » |
| 10 | C. K. Chow (1970), « On optimum recognition error and reject tradeoff », *IEEE Transactions on Information Theory* 16(1), 41-46 | DOI `10.1109/TIT.1970.1054406` | Origine de l'option de rejet : arbitrer entre erreur et abstention (titre). | `[méta]` Crossref 17:24:17Z ; page IEEE Xplore (WebFetch vers 17:36Z) : page sans contenu lisible (rendu par script), non lue | — |
| 11 | Yonatan Geifman, Ran El-Yaniv (2017), « Selective Classification for Deep Neural Networks », arXiv 1705.08500 (NeurIPS 2017) | arXiv `1705.08500` | Prédiction sélective : échanger de la couverture contre un risque contrôlé, abstention au test ; parallèle avec l'abstention nommée de Bell. | `[abs]` arXiv (GET 17:28:54Z) | « Selective classification techniques (also known as reject option) » ; « At test time, the classifier rejects instances as needed » |
| 12 | Stuart Haber, W. Scott Stornetta (1991), « How to time-stamp a digital document », *Journal of Cryptology* 3(2), 99-111 | DOI `10.1007/BF00196791` | Fondement de l'horodatage numérique (titre). | `[méta]` Crossref 17:24:35Z ; page Springer : connexion impossible (curl 17:31:33Z et 17:32:48Z, WebFetch « ECONNREFUSED ») | — |
| 13 | Peter Todd (15 Sep 2016), « OpenTimestamps: Scalable, Trust-Minimized, Distributed Timestamping with Bitcoin » (billet de l'auteur) ; site `https://opentimestamps.org/` | URL `https://petertodd.org/2016/opentimestamps-announcement` | Sémantique de l'ancre : existence **avant** un instant, pas davantage ; même borne que la page de méthode. | `[lu-curl]` billet (GET 17:36:32Z), P1 auteur ; site : `[lu-orch]` (`docs/course-bell/FAITS-opentimestamps-2026-09-22.md`, fait 1) et GET worker du 2026-09-24 09:08:14Z (`ADR-BELL-OTS-ANCHOR-1.md` §1.5) | « A timestamp proves that a message existed prior to some point in time » |
| 14 | B. Laurie, A. Langley, E. Kasper (June 2013), RFC 6962 « Certificate Transparency » (Experimental), rendu obsolète par B. Laurie, E. Messeri, R. Stradling (2021-12-09), RFC 9162 « Certificate Transparency Version 2.0 » (Experimental) | RFC 6962 ; RFC 9162 | Journal public en ajout seul que « anyone » peut auditer : modèle de la timeline chaînée et de la détection de réécriture par copie antérieure. | `[lu-curl]` `https://www.rfc-editor.org/info/rfc6962` (17:29:23Z : « This RFC is now obsolete, see RFC 9162 ») ; `https://www.rfc-editor.org/info/rfc9162` (17:29:32Z, date de publication lue dans la métadonnée `citation_publication_date` « 2021/12/09 ») | « publicly logging the existence of Transport Layer Security (TLS) certificates as they are issued or observed, in a manner that allows anyone to audit » |
| 15 | Zachary Newman, John Speed Meyers, Santiago Torres-Arias (2022), « Sigstore: Software Signing for Everybody », CCS '22, 2353-2367 | DOI `10.1145/3548606.3560596` (licence CC BY 4.0 selon Crossref) | Signature publique vérifiable adossée à un journal de transparence, appliquée à des artefacts publiés. | `[méta]` Crossref 17:24:41Z et 17:36:48Z (sous-titre et licence) ; page ACM : HTTP 403 (WebFetch vers 17:35Z), non contourné | — |

**Compléments vérifiés, hors des 15** :
- Signature Ed25519 : S. Josefsson, I. Liusvaara (January 2017), RFC 8032 « Edwards-Curve Digital Signature Algorithm (EdDSA) », Informational, IRTF (`https://www.rfc-editor.org/rfc/rfc8032.html`, GET 17:30:46Z, `[lu-curl]` en-tête et résumé ; `/info/rfc8032` avait répondu 502 à 17:29:52Z) ; D. J. Bernstein, N. Duif, T. Lange, P. Schwabe, B.-Y. Yang (2012), « High-speed high-security signatures », *Journal of Cryptographic Engineering* 2(2), 77-89, DOI `10.1007/s13389-012-0027-1` (`[abs]` par la description de la page Springer, GET 17:32:29Z : « Public keys are 32 bytes, and signatures are 64 bytes. »).
- Flux de données authentifié : F. Zhang, E. Cecchetti, K. Croman, A. Juels, E. Shi (2016), « Town Crier », CCS '16, 270-282, DOI `10.1145/2976749.2978326` (`[méta]` Crossref 17:37:42Z).
- Tokenisation, peg, microstructure DEX, conforme récent : les papiers arXiv de §2.3 (lignes 1 à 12), `[abs]`.
- Piste non ouverte : un rapport de Wharton (WIFPR) « Tokenizing Real-World Assets » attribué par un résultat WebSearch à Cong, Mayer et Rabetti (mai 2026) : `[2nd]`, PDF non ouvert.

### 3.2 Divergences relevées (non tranchées)

- **Synthèse WebSearch contre résumé primaire (Petajisto)** : la synthèse du moteur rend « the author introduces » et date la revue « 2016/2017 » ; le résumé primaire (RePEc) dit « I introduce » et Crossref date le numéro de janvier 2017 (v73 n1, p. 24-54). Sans effet sur le fond ; illustre qu'une synthèse de moteur n'est jamais un verbatim.
- **Date de Cong et al.** : Crossref ne donne que l'année (2025) ; la lettre v4 écrit « December 2025 » d'après le texte du papier lu par le dépôt (`SOURCES.md` Q3-8). Pas de contradiction, précision différente.

### 3.3 Conséquence pour l'item `<REF:cong_ssrn>` (`SOURCES.md` §C, item I-8)

Le registre DOI (Crossref, 17:34:59Z) associe `10.2139/ssrn.5937314` au titre « Tokenized Stocks » et aux cinq auteurs Lin William Cong, Wayne R. Landsman, Daniel Rabetti, Che Zhang, Wenqi Zhao : **l'identifiant 5937314 est confirmé sur une source primaire de métadonnées** (il ne venait jusqu'ici que d'un nom de fichier et d'une note de lecteur). La page SSRN elle-même n'a pas été lue (HTTP 403, non contourné).

### 3.4 Ce que je n'ai pas pu confirmer, et où j'ai cherché (§3)

- **Résumés non lus** (identité seule) : Engle-Sarkar (ProQuest : métadonnées ; éditeur : connexion requise, non suivie) ; Chow (IEEE Xplore : page rendue par script) ; Haber-Stornetta et Vovk-Gammerman-Shafer (Springer : connexion refusée ou redirection vide) ; Sigstore (ACM : 403). Procurement P-3 (§8).
- **Résumé du Mondrian Confidence Machine** : notice institutionnelle sans résumé ; la description vue n'est qu'une synthèse WebSearch `[2nd]`. P-3.
- **Page d'abstract SSRN de Cong et al.** : 403, non contourné (consigne de la mission).
- **Version arXiv de Cong et al.** : aucune trouvée par WebSearch (requête sur le titre et les cinq auteurs, résultat : SSRN seulement) ; absence non prouvée.

---

## 6. Contradictions et divergences (écrit à 2026-09-24T17:41:28Z)

| # | Source A | Source B | Divergence | Statut |
|---|---|---|---|---|
| D-1 | FAITS de l'orchestrateur : deux URL SSRN devinées « → page d'accueil Elsevier » | ce passage : `service.elsevier.com/…/supporthub/ssrn/` répond 308 vers `www.elsevier.support/ssrn` | explication, pas contradiction : le centre d'aide a changé d'hôte ; les articles vivent sous `/ssrn/answer/<slug>` | consigné |
| D-2 | lettre v4 §2 : « Bell publishes the ratio » | page de méthode : « The ratio values are not rendered on this site. » | les deux sont vrais (ratio dans l'état publié, absent du rendu du site) ; la règle du papier est à choisir (§4.3) | à trancher (investisseur) |
| D-3 | synthèse WebSearch sur Petajisto (« the author introduces », « 2016/2017 ») | résumé RePEc (« I introduce ») et Crossref (janvier 2017) | paraphrase de moteur contre texte primaire | primaire retenu ; la synthèse n'est jamais citée |
| D-4 | aide arXiv sur l'endossement (voie institutionnelle : e-mail institutionnel ET papier revendiqué) | billet arXiv du 21 janvier 2026 (Kat Boboris) : « arXiv will no longer accept institutional email addresses […] as the sole qualifier of endorsement for new authors » | concordant (le billet date le changement) ; confirme que MONARK relève de la voie personnelle | consigné |
| D-5 | Crossref : Cong et al. « 2025 » | lettre v4 : « December 2025 » (texte du papier, `SOURCES.md` Q3-8) | précision différente, pas de contradiction | consigné |

Aucune contradiction bloquante trouvée entre les sources primaires lues.

## 7. NON TROUVÉ (récapitulatif, avec les lieux de recherche)

1. **SSRN, auteur sans institution / affiliation d'entreprise** : get-started, adding-authors, PDF d'aide (étape 3), research-integrity, Terms of Use. → P-1.
2. **SSRN, choix d'une licence Creative Commons** : PDF d'aide du formulaire, copyright-policy, Terms of Use (juin 2017), Copyright Reference Guide (mai 2026, `https://supportcontent.elsevier.com/Support%20Hub/SSRN/34413_Copyright-Reference-Guide%20May2026.pdf`, GET 17:39:40Z, texte lu sur F: puis PDF supprimé) : le guide traite des versions (working paper, accepted manuscript, version of record) et des droits de tiers, pas d'un choix de licence par l'auteur. → P-2.
3. **SSRN, intitulé « FinTech »** dans les listes d'alertes FEN, CompSciRN, ERN, LSN ; arbre de classification du formulaire non vu (compte).
4. **SSRN, endossement** : aucune mention dans 14 pages d'aide et le PDF d'aide (constat d'absence, pas preuve).
5. **arXiv, endossement d'une cross-list** et **q-fin comme domaine unique** : `endorsement.html`, `cross.html`, `moderation/index.html`, `submit/index.html`, billet du 21 janvier 2026 (`https://blog.arxiv.org/2026/01/21/attention-authors-updated-endorsement-policy`, GET 17:39:29Z : « arXiv staff cannot waive endorsement requirements or provide a personal endorsement for authors. »). → P-4, C-2.
6. **arXiv, limite de taille chiffrée** : `sizes.html`, `submit/index.html`, `submit_tex.html`, `ancillary_files.html`. → P-5.
7. **Papiers arXiv titrés « tokenized stocks / equities »** : aucun trouvé (WebSearch + liste q-fin.TR d'août 2026) ; absence non prouvée.
8. **Résumés** d'Engle-Sarkar, Chow, Haber-Stornetta, Vovk-Gammerman-Shafer, Sigstore, Mondrian Confidence Machine : pages éditeur ou index inaccessibles ou sans résumé. → P-3.
9. **Page d'abstract SSRN de Cong et al.** : HTTP 403, non contourné (identité close par Crossref, §3.3).
10. **Portée du gate de vocabulaire et du test « aucun nom de fournisseur » sur un source TeX du papier** : non vérifiée (fichiers de configuration non lus). → à trancher au G0 du papier.

## 8. Demandes de procurement formées (adressées au mainteneur ; aucune action de compte ni contact par le chercheur)

| # | Objet | Identité | Tentatives faites | Canal proposé | Usage prévu |
|---|---|---|---|---|---|
| P-1 | Règle SSRN pour un auteur indépendant et pour une affiliation d'entreprise (« MONARK ») | SSRN Support Center (Elsevier) ; pages lues listées au §1.1 | 14 pages d'aide, PDF d'aide du formulaire, Terms of Use, guide de copyright (§1.1, §7) | question écrite au support SSRN par l'investisseur (acte de contact : hors mandat) ; ou constat lors d'un dépôt réel | ligne d'affiliation de la page de titre ; risque de refus final |
| P-2 | Possibilité de déclarer une licence CC sur un working paper SSRN | idem | idem, + Copyright Reference Guide (mai 2026) | idem | cohérence avec la licence arXiv, **irrévocable** |
| P-3 | Textes ou résumés de six références `[méta]` : (a) R. F. Engle, D. Sarkar, « Premiums-Discounts and Exchange Traded Funds », *J. Derivatives* 13(4):27-45, 2006, DOI `10.3905/jod.2006.635418` ; (b) C. K. Chow, « On optimum recognition error and reject tradeoff », *IEEE Trans. Inf. Theory* 16(1):41-46, 1970, DOI `10.1109/TIT.1970.1054406` ; (c) S. Haber, W. S. Stornetta, « How to time-stamp a digital document », *J. Cryptology* 3(2):99-111, 1991, DOI `10.1007/BF00196791` ; (d) V. Vovk, A. Gammerman, G. Shafer, *Algorithmic Learning in a Random World*, 2ᵉ éd., Springer, 2022, DOI `10.1007/978-3-031-06649-8` (chapitre sur les prédicteurs de Mondrian) ; (e) Z. Newman, J. S. Meyers, S. Torres-Arias, « Sigstore: Software Signing for Everybody », CCS '22, pp. 2353-2367, DOI `10.1145/3548606.3560596` (CC BY 4.0 selon Crossref : acquisition libre possible) ; (f) V. Vovk, D. Lindsay, I. Nouretdinov, A. Gammerman, « Mondrian Confidence Machine », On-line Compression Modelling project, Working Paper 4, mars 2003 | Crossref (métadonnées) pour (a)-(e) ; notice Royal Holloway pour (f) | pages éditeur : 403 (ACM, tandfonline), redirection d'identité (PM Research), page vide (IEEE), connexion refusée (Springer) ; ProQuest openview (métadonnées seules) | accès bibliothèque ou copies d'auteur fournies par le mainteneur ; (e) téléchargeable librement par l'investisseur | rédaction de la section « Related work » au-delà du titre ; citations exactes |
| P-4 | Règle arXiv : (i) un endosseur q-fin.ST vaut-il pour q-fin.TR (domaine q-fin unique) ; (ii) une cross-list cs.CR exige-t-elle un endossement cs | arXiv help et blog | cinq pages lues (§7 point 5) | au moment de l'ouverture de la soumission (le système nomme l'endossement requis) ; ou formulaire « Endorsement Policy Feedback Form » cité par le billet du 21 janvier 2026 (acte de contact : hors mandat) | choix catégorie primaire et cross-list ; nombre d'endosseurs à trouver |
| P-5 | Limite de taille arXiv chiffrée | arXiv help | quatre pages (§7 point 6) | affichée à l'étape « Add Files » ; ou aide arXiv | taille des figures et des fichiers auxiliaires |
| P-6 | Texte de la lettre 4-927 **tel que publié par la SEC** | SEC, File No. 4-927 ; page `https://www.sec.gov/rules-regulations/public-comments/4-927` (item SEC-POSTED-1, décision 199) | non lu ici (hors mission) | surveillance par l'orchestrateur (« We generally post comments within 3 to 5 business days », décision 199) | Annexe A du papier |

## 9. Demandes de consultation formées (à router par l'orchestrateur ; aucune consultation de l'advisor intégré pendant ou après l'extraction)

- **C-1 (advisor, doctrine de positionnement)** — *Problème* : choisir la catégorie primaire arXiv d'un papier « méthode + mesure » sur des jetons d'actions. *Tentatives* : définitions officielles lues (§2.1) ; catégories primaires de 14 papiers proches relevées (q-fin.TR ×4, q-fin.GN ×2, cs.CE ×3, econ.GN, stat.ML, stat.ME, cs.CR, cs.AI). *Options* : (a) q-fin.TR + cross-list cs.CR ; (b) q-fin.GN + cross-lists q-fin.TR, cs.CR ; (c) cs.CE (domaine d'endossement cs) + cross-list q-fin.TR.
- **C-2 (advisor)** — *Problème* : faut-il ajouter la cross-list cs.CR dès la première soumission alors que l'exigence d'endossement d'une cross-list est inconnue (P-4) ? *Options* : (a) soumettre en q-fin seul, ajouter cs.CR plus tard par la fonction de cross-list ; (b) soumettre avec cs.CR et traiter un éventuel second endossement ; (c) attendre la réponse P-4.
- **C-3 (lecture-advisor, calibrage)** — *Problème* : le niveau `[méta]` (identité vérifiée au registre DOI, contenu non lu) n'existe pas dans la triade du doc 03. *Tentative* : traité comme `[2nd]` pour tout contenu (seul le titre est emprunté) + procurement P-3. *Options* : (a) garder `[méta]` ainsi défini ; (b) le fondre dans `[2nd]` ; (c) exiger `[abs]` pour toute référence citée dans le papier.
- **C-4 (investisseur et juriste, hors advisor)** — *Problème* : un papier sous licence CC BY qui imprimerait g et le VWAP on-chain d'une même session rendrait le close recalculable (§4.3). *Options* : (a) parts et distributions seulement ; (b) forme binnée ; (c) valeurs par session si l'avis juriste de la décision 165 le permet.

## 10. Journal des URL (heure `date -u` du lancement du GET ; échecs inclus)

| Heure (UTC) | URL | Outil | Résultat |
|---|---|---|---|
| ~16:52 | `https://service.elsevier.com/app/home/supporthub/ssrn/` | WebFetch | 308 → `https://www.elsevier.support/ssrn` |
| 16:52:26 | `https://service.elsevier.com/app/home/supporthub/ssrn/` | curl | échec TLS `CRYPT_E_REVOCATION_OFFLINE`, **non contourné** |
| ~16:52 | `https://www.elsevier.support/ssrn` | WebFetch | 200 (liste des articles) |
| 16:53:04 | `https://www.elsevier.support/ssrn/answer/get-started` | curl (test) | 200 |
| 16:53:33 → 16:53:51 | `…/ssrn/answer/{get-started, ssrn-review-process, copyright-policy, what-is-ssrn, how-do-i-revise-a-submission, remove-my-paper}`, `…/ssrn/news/{submission-form, welcome-to-ssrn-elseviers-preprint-server}` | curl | 200 ×8 |
| 16:54:37 | `https://www.elsevier.support/ssrn` | curl | 200 |
| 16:54:42 → 16:54:50 | `…/ssrn/category/{10543, 10545, 10546, 10547}` | curl | 200 ×4 |
| 16:54:52 ; 16:55:37 | `…/ssrn/category/19203` | curl | échec de connexion ×2 ; 200 à 16:58:00 |
| 16:55:21 → 16:55:33 | `…/ssrn/answer/{classification-distribution, doi, adding-authors, is-ssrn-a-publisher}` | curl | 200 ×4 |
| 16:56:27 ; 16:56:30 | `…/ssrn/answer/{nonscholarly, research-integrity}` | curl | 200 ×2 |
| 16:56:44 ; 16:56:50 | `https://www.ssrn.com/index.cfm/en/terms-of-use/` | curl | 200 |
| ~16:57:2x | `https://supportcontent.elsevier.com/Support%20Hub/SSRN/SSRN_NewSubmissionForm.pdf` | WebFetch | binaire non lu ; **copie déposée automatiquement sous C: par l'outil, supprimée à 16:57:41** |
| 16:57:48 | idem | curl (F:), `pdftotext`, PDF supprimé | 200, 1 012 015 o |
| 16:58:18 ; 16:58:24 | `https://www.ssrn.com/index.cfm/en/fen/` ; `…/fen/fen-ejournals/` | curl | 200 ×2 |
| 16:58:52 → 16:59:07 | `https://www.ssrn.com/index.cfm/en/{compscirn, ern, lsn}/…-ejournals/` | curl | 200 ×3 |
| 17:00:57 | `https://arxiv.org/robots.txt` | curl | 200 |
| 17:01:11 | `https://arxiv.org/category_taxonomy` | curl | échec de connexion |
| 17:01:53 | idem | curl (ré-essai) | 200 |
| 17:02:55 | `https://arxiv.org/archive/q-fin` | curl (ré-essai) | 200 |
| 17:03:39 | `https://info.arxiv.org/help/endorsement.html` | curl | 200 |
| 17:03:58 | `https://info.arxiv.org/help/cross.html` | curl | 200 |
| 17:04:08 | `https://info.arxiv.org/help/moderation/index.html` | curl | 200 |
| 17:04-17:05 | WebSearch (domaine `arxiv.org`, 10 requêtes, §2.3) | WebSearch | résultats (P3, jamais cités comme faits) |
| ~16:52 ; ~16:58 ; ~17:35-17:37 | WebSearch, autres requêtes : 5 sur le domaine `service.elsevier.com` (titres des articles SSRN), 2 sur `ssrn.com` (FEN, FinTech), 1 « Tokenized Stocks » (titre et auteurs), 1 « Mondrian confidence machine », 2 sur les résumés d'ETF (Petajisto, Engle-Sarkar) | WebSearch | orientation seulement (P3), jamais cité comme fait |
| 17:05:12 | `https://arxiv.org/list/q-fin.TR/2026-08?skip=0&show=250` | curl | 200 |
| 17:05:58 → 17:16:40 | `https://arxiv.org/abs/{2608.09188, 2609.15797, 2606.01131, 2606.13822, 2508.11651, 2601.18991, 2506.08718, 2410.19107, 2605.17705, 2603.13252, 2609.12582, 2604.13458, 2602.10018}` | curl, ≥ 15 s d'écart | 200 ×13 |
| 17:09:49 ; 17:18:08 | `https://arxiv.org/abs/2606.07442` | curl | échec de connexion, puis 200 |
| 17:16:18 | `https://info.arxiv.org/robots.txt` | curl | 404 (pas de robots.txt) |
| 17:16:26 → 17:16:50 | `https://info.arxiv.org/help/{submit/index.html, submit_tex.html, submit_pdf.html, ancillary_files.html, sizes.html, license/index.html}` | curl | 200 ×6 |
| 17:20:12 | `https://info.arxiv.org/help/prep.html` | curl | 200 |
| 17:20:39 | `https://www.aeaweb.org/econlit/jelCodes.php?view=jel` | curl | 200 |
| 17:23:27 | `https://www.crossref.org/documentation/retrieve-metadata/rest-api/` | curl | 200 (conditions lues avant l'API) |
| 17:23:58 → 17:26:08 | `https://api.crossref.org/works?…` (11 requêtes bibliographiques) et `https://api.crossref.org/works/<doi>` (11) | node fetch, pool public, sans e-mail | 200 ×22 |
| 17:26:27 ; 17:27:21 ; 17:28:54 | `https://arxiv.org/abs/{2107.07511, 2202.13415, 1705.08500}` | curl | 200 ×3 |
| 17:29:23 ; 17:29:32 | `https://www.rfc-editor.org/info/rfc6962` ; `…/rfc9162` | curl | 200 ×2 |
| 17:29:52 | `https://www.rfc-editor.org/info/rfc8032` | curl | **502** |
| 17:30:46 | `https://www.rfc-editor.org/rfc/rfc8032.html` | curl | 200 |
| 17:31:33 ; 17:32:48 | `https://link.springer.com/article/10.1007/BF00196791` | curl | échec de connexion ×2 |
| 17:31:58 ; 17:34:16 | `https://link.springer.com/book/10.1007/978-3-031-06649-8` | curl | échec ; puis 303 sans corps |
| 17:32:23 | `https://www.nber.org/papers/w27136` | curl | 200 |
| 17:32:29 | `https://link.springer.com/article/10.1007/s13389-012-0027-1` | curl | 200 |
| 17:32-17:35 | `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5937314` | WebFetch | **403, non contourné** (une seule tentative) |
| 17:34:59 ; 17:35:02 | `https://api.crossref.org/works/10.2139%2Fssrn.5937314` | node fetch | 200 ×2 |
| ~17:35 | WebSearch « "Tokenized Stocks" Cong Landsman Rabetti Zhang Zhao » | WebSearch | SSRN seulement |
| ~17:35 | `https://link.springer.com/article/10.1007/BF00196791` ; `https://link.springer.com/book/10.1007/978-3-031-06649-8` | WebFetch | ECONNREFUSED ×2 |
| ~17:35 | `https://dl.acm.org/doi/10.1145/3548606.3560596` | WebFetch | **403, non contourné** |
| ~17:36 | `https://www.tandfonline.com/doi/full/10.2469/faj.v73.n1.7` | WebFetch | **403, non contourné** |
| ~17:36 | `https://www.pm-research.com/content/iijderiv/13/4/27` | WebFetch | 302 vers un fournisseur d'identité, **non suivi** |
| ~17:36 | `https://ieeexplore.ieee.org/document/1054406` | WebFetch | page vide (rendu par script) |
| 17:36:18 | `https://pure.royalholloway.ac.uk/en/publications/mondrian-confidence-machine/` | curl | 200 |
| 17:36:32 | `https://petertodd.org/2016/opentimestamps-announcement` | curl | 200 |
| 17:36:48 | `https://api.crossref.org/works/10.1145%2F3548606.3560596` | node fetch | 200 |
| 17:37:07 | `https://ideas.repec.org/a/taf/ufajxx/v73y2017i1p24-54.html` | curl | 200 |
| 17:37:12 | `https://www.proquest.com/openview/97dd85e2b067d89bfb8df82ca16e5257/1?pq-origsite=gscholar&cbl=32822` | curl | 200 (métadonnées seules) |
| 17:37:42 | `https://api.crossref.org/works?…` (Town Crier) | node fetch | 200 |
| 17:39:29 | `https://blog.arxiv.org/2026/01/21/attention-authors-updated-endorsement-policy` | curl | 200 |
| 17:39:40 | `https://supportcontent.elsevier.com/Support%20Hub/SSRN/34413_Copyright-Reference-Guide%20May2026.pdf` | curl (F:), `pdftotext`, PDF supprimé | 200, 8 814 615 o |

Aucun compte, aucun formulaire, aucun contact, aucun lien `/auth/` suivi, aucun contournement (TLS, 403, redirection d'identité). Copies de travail des pages tierces conservées sur F: (scratchpad de session) le temps de l'extraction, supprimées en fin de passe (§12).

## 11. Décisions à prendre (« Needs from you »), versées ici pour la durabilité

1. **Plateforme** : SSRN seul (pas d'endossement, pas de frais, mais refus final possible pour contenu jugé commercial ou « framework »), arXiv seul (endossement personnel requis, sources TeX), ou les deux (permis ; SSRN met en garde contre la dilution des métriques et la double attribution de DOI).
2. **Catégorie arXiv** : q-fin.TR primaire + cs.CR en cross-list (proposition), ou q-fin.GN, ou cs.CE (C-1, C-2).
3. **Licence** : arXiv impose un choix irrévocable (CC BY 4.0, CC BY-SA 4.0, CC BY-NC-SA 4.0, CC BY-NC-ND 4.0, licence non exclusive arXiv 1.0, CC0) ; SSRN ne propose pas de choix CC (d'après les pages lues). La recommandation des FAITS (CC BY 4.0) doit être pesée avec §4.3 (réutilisation commerciale de tout ce que contient le papier).
4. **Endosseur** : voie personnelle obligatoire pour MONARK ; l'auteur ouvre lui-même une soumission, reçoit le code et sollicite un endosseur qu'il connaît ou dont il cite le travail (réservoir en §2.3, noms seulement) ; aucun contact n'a été pris.
5. **Affiliation et déclarations** : « MONARK » comme affiliation (non traité par SSRN ; arXiv exige une affiliation réelle et sanctionne la fausse déclaration) ; déclaration d'usage de l'IA (obligatoire sur SSRN si IA ; exigée par la politique arXiv selon les normes de méthodologie) ; déclaration de conflit d'intérêts.
6. **Date de dépôt** : avant ou après (a) la mesure fondatrice (table T3 presque vide aujourd'hui), (b) l'export du collecteur (le titre dit « replayable »), (c) l'ancrage des publications, (d) la publication de la lettre par la SEC (Annexe A).
7. **Règles de contenu** : ratio de volume imprimé ou non (D-2) ; g par session ou distributions seulement (C-4) ; place du conforme (Bell ne l'implémente pas : §5.4, note).

---

## 12. Clôture de la passe (écrit à 2026-09-24T17:42:46Z)

- **Ligne d'arrivée** : les cinq sections de la mission sont écrites (§1 SSRN, §2 arXiv, §3 corpus, §4 « écarts oui, niveaux non », §5 format et plan), chacune fermée par « ce que je n'ai pas pu confirmer, et où j'ai cherché » (§1.4, §2.4, §3.4, §4.4, §5.5).
- **Écritures** : ce seul fichier dans le dépôt `F:\Monark` (aucun autre fichier du dépôt touché, aucun commit, R-20). Fichiers de travail sur F: uniquement (scratchpad de session) : scripts du chercheur (`html2txt.mjs`, `absparse.mjs`, `crossref.mjs`, `crossref-abs.mjs`) et brouillons de sections, conservés ; **copies des pages tierces** (SSRN, arXiv, index, RFC, JEL) **supprimées à 2026-09-24T17:42:13Z**. Les deux PDF d'aide SSRN (en accès libre) n'ont été lus qu'en texte puis supprimés aussitôt.
- **Rien sur C:** : trois fichiers déposés automatiquement par l'outillage dans `C:\Users\KACIMI\.claude\projects\…\tool-results\` (deux sorties longues de lecture, une copie binaire de PDF par WebFetch) ont été supprimés à 16:57:41Z ; les autres fichiers de ce répertoire ne sont pas de cette passe et n'ont pas été touchés.
- **Hors mandat, non fait** : aucun compte, aucun formulaire, aucun contact d'endosseur ni de support, aucun lien `/auth/` d'arXiv suivi, aucun contournement (révocation TLS, 403, redirection d'identité).
- **Advisor** : une consultation intégrée avant toute extraction ; aucune après (règle du filtre de régurgitation) ; les questions restantes sont les demandes formées C-1 à C-4 (§9).
- **Empreinte** : le sha256 de ce fichier est rendu hors du fichier (rapport au donneur d'ordre).
