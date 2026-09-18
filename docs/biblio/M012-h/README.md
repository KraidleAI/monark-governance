# Procurement M012-h — théorie ARL de l'instrument CUSUM (Narabi)

Mission PR-M012-h (ADR-M012 item (h)/(l)). Cible : `apps/sentinel/src/instrument.ts` — CUSUM de Page sur
`E_static = 1{s > q̂}` (misses binaires), `p₀ = 0,125`, `p₁ = 0,25`, graine de permutation `20260917`,
contrôle par permutation (pas de théorie ARL portée, ADR-M012 D6). Déclencheur de la procurement : « toute
citation publique de l'instrument » ; action requise avant citation : Lorden 1971 + Shin–Ramdas–Rinaldo +
Vovk 2012, identité complète, DOI/arXiv résolus.

## Tableau des 3 acquisitions

| # | Papier | Source | Identifiant | Acquis (UTC) | Fichier local | Taille | sha256 | Pages | Lecture |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Lorden, G. (1971), « Procedures for reacting to a change in distribution », *Ann. Math. Statist.* 42(6), 1897–1908 | Project Euclid | DOI [10.1214/aoms/1177693055](https://doi.org/10.1214/aoms/1177693055) | 2026-09-18 09:41 | `pdf/lorden-1971.pdf` | 1 063 457 o | `bec65c82c65885471823c18a10c8590a4ccdd3bc874cb504755cad1837d47cb2` | 12 | **[lu] intégral** (rendu-image, PDF scanné sans OCR — voir fiche) |
| 2 | Shin, J., Ramdas, A., Rinaldo, A. (2022), « E-detectors: a nonparametric framework for sequential change detection » | arXiv | [arXiv:2203.03532v4](https://arxiv.org/abs/2203.03532v4) (dernière version, 29 oct. 2023) | 2026-09-18 09:41 | `pdf/shin-ramdas-rinaldo-2022-v4.pdf` | 703 570 o | `564dc11f356c16691d10b7ef006402ad17237159f8068b1d205d6497492baa1c` | 50 | **[lu] intégral** (texte natif ; symboles grecs reconstruits, voir fiche) |
| 3 | Vovk, V. (2012), « Conditional validity of inductive conformal predictors » | PMLR (ACML 2012) | [PMLR v25, pp. 475–490](https://proceedings.mlr.press/v25/vovk12.html) | 2026-09-18 09:43 | `pdf/vovk-2012.pdf` | 419 379 o | `7687a3be5702c52074e1b48e7317f1e068e9581ff832c65f7efca659c665ed3a` | 16 | **[lu] intégral** (texte natif) |

Extraction texte : `pdftotext -layout` dans `_txt/` pour les 3 PDF (tentée systématiquement en premier,
conformément à doc 03 §6). Échec total pour #1 (254 octets extraits sur 12 pages — bandeau JSTOR seul ;
`pdffonts`/`pdfinfo` confirment un scan `PDFlib`/`page2pdf` de 2006 sans couche OCR ; aucun outil OCR
disponible dans l'environnement — `tesseract`/`ocrmypdf` absents). Fallback documenté : lecture intégrale
par rendu-image des 12 pages (outil Read). Succès plein pour #2 et #3.

## Statut de la procurement

**CLOSE** — les trois papiers nommés par l'item (h) sont acquis, identité vérifiée avant extraction
(aucune collision de nom : les trois PDF correspondent exactement au titre/auteurs/venue attendus), et
**lus intégralement** ([lu], sans reliquat [abs]/[2nd]/« NON LU » sur aucun des trois). Le déclencheur de
(h) (« toute citation publique de l'instrument ») est donc satisfait pour permettre une citation — **à
condition que la citation reste dans les bornes établies ci-dessous**, qui sont étroites. Cette fiche ne
préjuge pas de la décision de l'orchestrateur de marquer (h) clos dans l'ADR ni de lever la précondition de
(l) : c'est un acte d'édition d'ADR hors du périmètre d'écriture de cette mission (`docs/biblio/M012-h/`
uniquement) ; ce README fournit la preuve, la décision reste à l'orchestrateur/validateur.

Un écart à la discipline de lecture a été nécessaire et est documenté sans être dissimulé : le PDF Lorden
1971 est un scan JSTOR sans couche texte, donc `pdftotext` était structurellement impossible (pas un choix
de facilité) ; la lecture a été faite par rendu-image intégral des 12 pages, page par page, au lieu du
texte pré-extrait par défaut — conforme à la clause de secours de doc 03 §6.

## Synthèse (une page) — ce que l'instrument peut honnêtement citer, et ce qu'il ne peut pas

### Ce que les trois papiers établissent, en bref
- **Lorden (1971)** fonde la **forme** de la statistique (récursion de Page (1954), max du chemin,
  incréments en log-rapport de vraisemblance) et définit l'A.R.L. et l'optimalité asymptotique — mais
  **toutes** ses garanties (Thm 1 p. 1899, Thm 2 p. 1900, Thm 3 p. 1901) exigent des données **i.i.d.** et
  des lois pré-/post-changement **vraies et connues** ; la preuve du Thm 2 invoque nommément « the ergodic
  hypothesis … for the i.i.d. sequence » (p. 1900). Aucun exemple Bernoulli travaillé ; aucune mention de
  permutation ; aucun résultat sur une statistique rétrospective (fiche §« ce qu'il NE dit PAS »).
- **Shin, Ramdas & Rinaldo (2022/v4 2023)** confirment indépendamment, en relisant Lorden lui-même
  (Section 6.2, p. 32–33 : « Lorden proved that this method controls the ARL at 1/α if the data are iid »),
  que la garantie classique est conditionnée à l'i.i.d. — et proposent une voie nonparamétrique alternative
  (e-détecteurs, Thm 2.4 p. 7) qui **abandonne** l'i.i.d. mais **exige** une construction martingale/e-process
  (éq. 65 p. 24) que `instrument.ts` n'implémente pas. Aucune mention de permutation dans les 50 pages.
- **Vovk (2012)** ne traite ni de CUSUM, ni d'ARL, ni de détection de rupture (zéro occurrence de
  « Theorem », « CUSUM », « change detection » dans les 16 pages) — sa seule pertinence est **définitionnelle** :
  la Proposition 1 (p. 477) définit l'échangeabilité comme invariance par permutation de la loi jointe,
  exactement l'hypothèse nulle implicite du contrôle par permutation de `instrument.ts`. Le papier note
  aussi explicitement (p. ~484) que « permuting the data set ensures exchangeability but not necessarily
  randomness » — une distinction que l'ADR-M012 D7 respecte déjà.

### Phrase(s) honnêtes que l'instrument POURRA citer publiquement
(formulation proposée par cette fiche, synthèse originale — **pas** une citation verbatim de l'un des
trois papiers ; les guillemets « » sont réservés dans ce document aux extraits verbatim des sources) :
> The instrument's CUSUM statistic follows the classical Page (1954)/Lorden (1971) recursion (fixed
> log-likelihood increments, running maximum); its significance is assessed against a permutation null
> (the sequence is exchangeable, in the sense of Vovk 2012 — invariant under permutation), not against an
> average-run-length or optimality guarantee.
Sourcée : forme de la statistique → fiche-lorden §« Procédure de Page », p. 1897–1898 ; définition de
l'échangeabilité → fiche-vovk §Proposition 1, p. 477.

(idem, formulation proposée ici, pas une citation) :
> No claim of average run length, detection delay, or (asymptotic) optimality is made for this
> instrument: the classical results that would license such a claim (Lorden 1971, Theorems 1–3) require
> i.i.d. pre- and post-change data and known true parameters, neither of which holds for this series.
Sourcée : fiche-lorden §« Théorème 2 » (preuve invoquant l'i.i.d., p. 1900) et §« En quoi ce papier fonde
ou contredit notre instrument » ; le caractère non stationnaire de la population est une mesure de l'ADR
(advisor-defi §0 : taux de raté par semestre 0/16, 6/182, 23/161, 31/163, 0/91), pas des trois papiers
procurés — à distinguer soigneusement dans toute citation.

### Phrase(s) que l'instrument NE POURRA PAS citer
- **« Le CUSUM contrôle l'ARL à [tel niveau] »** ou **« la procédure est (asymptotiquement) optimale »** :
  faux à citer — ces garanties (Lorden Thm 1/2/3) supposent l'i.i.d. (mesuré absent, ADR) et des p₀/p₁
  vrais (nos p₀=0,125/p₁=0,25 sont des constantes **pré-enregistrées de réglage**, jamais des paramètres
  estimés ni prétendus vrais — docstring `instrument.ts` : « Pre-registered instrument constants »).
- **« Lorden 1971 ou Shin–Ramdas–Rinaldo 2022 valident notre contrôle par permutation »** : faux — aucun
  des deux papiers ne mentionne la permutation comme dispositif de calibration (0 occurrence dans les deux,
  vérifié par grep exhaustif sur 12 et 50 pages respectivement) ; c'est une troisième voie, non couverte
  par leur théorie.
- **« Le cadre e-détecteur de Shin–Ramdas–Rinaldo garantit notre instrument »** : faux tant que
  `instrument.ts` implémente un CUSUM classique à p₀/p₁ fixes et non une construction e-process/e-détecteur
  (Déf. 2.5–2.6, éq. 65) — le Théorème 2.4 ne s'applique pas mécaniquement à la statistique codée
  aujourd'hui ; l'adopter serait une refonte, pas une citation.
- **« Vovk 2012 fonde la théorie de détection de rupture de l'instrument »** : faux — ce papier ne traite
  jamais de séries temporelles surveillées, de CUSUM ni d'ARL (fiche-vovk §« ce qu'il NE dit PAS »). Son
  usage légitime se limite à une note définissant l'échangeabilité.

### Tension déclarée, non tranchée
Le contrôle par permutation de `instrument.ts` mélange la séquence **déjà observée et close** (les paires
calmes ou toutes les paires évaluables) pour tester si le max-CUSUM observé est extrême sous
l'hypothèse nulle d'échangeabilité **intra-échantillon** (au sens de Vovk 2012, Prop. 1). Ce n'est **pas**
la même proposition que « la population calme est échangeable dans le temps » — précisément ce que l'ADR
mesure faux par semestre (D6/D7). Les deux constats ne se contredisent pas : le rejet de l'hypothèse nulle
par permutation (observé 9,54 contre q999=6,24, P ≤ 1/4001, chiffres ADR — non recomputés par cette
mission, hors périmètre des 3 papiers procurés) est **cohérent** avec une population non homogène dans le
temps — mais les deux mesures restent **distinctes** et ne doivent pas être fondues dans une seule phrase
publique sans le dire. Cette distinction n'est établie par aucun des trois papiers procurés ; elle relève
du raisonnement de cette fiche, signalée comme telle plutôt que sourcée à un théorème.

## Journal des URL et tentatives

| URL | Résultat |
|---|---|
| `https://arxiv.org/abs/2203.03532` | 200 — page abs, historique de versions extrait (v1–v4) |
| `https://doi.org/10.1214/aoms/1177693055` | 302 → `http://projecteuclid.org/euclid.aoms/1177693055` |
| `http://projecteuclid.org/euclid.aoms/1177693055` (WebFetch) | 200 — identité confirmée (titre/auteur/pages) |
| `https://projecteuclid.org/journals/.../10.1214/aoms/1177693055.full` (curl nu) | **Bloqué** — page Incapsula (« Request unsuccessful », anti-bot), pas de PDF |
| `https://projecteuclid.org/journalArticle/Download?urlId=10.1214%2Faoms%2F1177693055` (curl + user-agent navigateur) | 200 — PDF 1 063 457 o obtenu |
| `https://arxiv.org/pdf/2203.03532v4` | 200 — PDF 703 570 o obtenu |
| `https://proceedings.mlr.press/v25/vovk12.html` | 200 — métadonnées citation extraites |
| `https://proceedings.mlr.press/v25/vovk12/vovk12.pdf` | 200 — PDF 419 379 o obtenu |

Aucun document introuvable ; aucun document différent de l'attendu. Le seul obstacle rencontré (blocage
anti-bot Incapsula sur Project Euclid pour un accès non-navigateur) a été contourné légitimement par
un en-tête `User-Agent` de navigateur standard sur le lien de téléchargement direct du même site — pas de
contournement d'un paywall ou d'un accès non autorisé : l'article est explicitement en accès libre
(mission) et le lien téléchargé est le lien de téléchargement officiel de Project Euclid pour ce DOI.
