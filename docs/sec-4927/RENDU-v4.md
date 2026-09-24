# RENDU-v4 — lettre de commentaire SEC File No. 4-927 (MONARK Bell), version 4 (décision investisseur 192)

## Needs from you (investisseur) — dans l'ordre où ils bloquent le dépôt

1. **Colonne « Bell » du tableau de la question 3 : choisir (a) ou (b).** La publication du 24 septembre ne remplit pas ces
   7 champs (preuves au §3 : pour TSLAx, une seule session de nuit en semaine, aucune session de week-end, un seul jour de
   bourse). Une question est aussi à trancher : une part de sessions au-delà d'un seuil, calculée à partir du cours de clôture
   sous licence, est-elle une « valeur dérivée d'une source sous licence » au sens de la règle transmise par la mission ?
   C'est une lecture du worker [analyse], pas un énoncé de la règle. Cong et al. publient leurs propres parts, et la lettre est
   permanente.
   - (a) Garder les 7 champs et attendre la mesure fondatrice (course de juillet à octobre 2025) **et** une décision sur la
     licence.
   - (b) Déposer sans chiffres Bell : un texte de remplacement est prêt (§3.3). Il a été mesuré et laisse 5 champs, tous à vous.
     Il doit être relu avant dépôt.
2. **Référence SSRN** : ouvrez `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5937314` dans votre navigateur (l'orchestrateur
   a été arrêté par la vérification anti-robot, non contournée). Vérifiez le titre « Tokenized Stocks », les auteurs Lin William
   Cong, Wayne Landsman, Daniel Rabetti, Che Zhang et Wenqi Zhao, et la date « December 2025 ». Répondez « SSRN 5937314 OK » ou
   donnez le bon identifiant. Sans confirmation, le champ est retiré et la citation par auteurs, titre et date reste.
3. **Date et canal de dépôt** : la date de la lettre est la date du dépôt (format « Month D, YYYY »). Un seul canal (« please use
   only one method », ordre p.59-60) :
   - le formulaire internet de la SEC, recommandé : PDF, au plus 3 fichiers et 5 MB, mention « Comments attached » dans la zone de
     texte (FAITS sec.gov l.7) ;
   - ou `rule-comments@sec.gov`, avec « File Number 4-927 » en objet.
4. **Signataire** : nom, titre et organisation, tels qu'ils apparaîtront de façon permanente dans le champ public « Commenter
   Name ». MONARK n'est pas encore une société constituée (NOTE-DEPOT l.43, AI-3).
5. **Contact public** : confirmez `bell@monarkgate.tech` (déjà public sur `/bell` et `/bell/method`, lu le 24/09) ou donnez une
   autre adresse. Elle sera publiée sans expurgation (ordre p.60).
6. **Phrase sur la relation commerciale** : texte exact, vrai à la date du dépôt. Candidat : « MONARK has no commercial
   relationship with the issuers or venues measured as of the filing date » (NOTE-DEPOT l.45, AI-5).
7. **Format** : en Times 11 pt, la v4 tient en **3 pages** (mesure). En 12 pt, elle fait 4 pages. La v3 committée faisait déjà
   4 pages en 12 pt une fois le bloc d'adresse mis en page ligne par ligne comme dans une vraie lettre (§6.5). Choisissez :
   11 pt, 4 pages en 12 pt, ou des coupes (à demander à l'orchestrateur).
8. **Vérification des preuves d'ancrage contre un nœud Bitcoin** (item BELL-OTS-NODE-VERIFY-1). L'ADR d'ancrage en fait une
   condition avant le dépôt (ADR-BELL-OTS-ANCHOR-1 l.306, correction C-2). Le choix de l'option est une décision de coût qui
   vous revient. L'autre voie est de lever explicitement cette condition pour ce dépôt : la lettre écrit déjà « not checked
   against a node ».
9. **GO de dépôt explicite** (NOTE-DEPOT l.41, AI-1), après les points 1 à 8.

## 0. Provenance et état en une ligne

- **Modèle résolu : `claude-opus-5-5[1m]`** (R-1, préfixe attendu `claude-opus-5-5`, déclaré en tête de session). Effort max.
  Mission de l'orchestrateur « SEC-4927-v4 » (décision investisseur 192, CHANTIERS:1426).
- **Horloge** (`date -u`) : début 14:00:01Z ; GET 14:01:25Z à 14:02:02Z ; v4 écrite à 14:31:14Z, puis reconstruite après la
  revue finale (placeholder E05 seulement, avant 14:48:24Z) ; rendu rédigé à partir de 14:38:36Z ; dernier relevé 14:48:24Z.
- **Dépôt** : `F:\Monark`, lu en lecture seule (`lot/etude-suite`). HEAD `b980215` au départ (14:00Z). Il a avancé pendant la
  mission par des commits de l'orchestrateur : `0db8748` (CHANTIERS, décision 192), puis `7cffd34`, `694e98b`, `1c78543` et
  `84add61`. Ces commits touchent CHANTIERS, ADR-BELL-OTS-ANCHOR-1 et `docs/bell-publications/*`, aucun fichier de
  `docs/sec-4927/` (`git diff --stat b980215..HEAD`).
- **Écritures** (trois seulement) :
  - `docs/sec-4927/LETTRE-4-927-v4.md` ;
  - ce fichier ;
  - `docs/sec-4927/work-2026-09-24/` (`LECTURES-SERVIES-2026-09-24.md`, `DIFF-v3-v4.md`).
  Temporaires dans le scratchpad de session `F:\tmp\claude\F--Shogen\90684fb2-4e7b-42e9-b820-f042dc4465f3\scratchpad\sec4927-v4\`.
- **Interdits respectés** : aucun commit, aucun workflow (R-20). Réseau limité à 12 GET publics (`LECTURES-SERVIES` §1). Ceinture
  `env -u …` sur chaque commande node.
- **Incident déclaré (disque C:)** : la lecture de `RENDU-v3.md` par `cat` a produit une sortie trop longue. Le harnais l'a
  alors enregistrée d'office sous `C:\Users\KACIMI\.claude\projects\F--Shogen\...\tool-results\bmqewgb9s.txt`. Ce n'est pas une
  écriture du worker, mais elle est causée par sa commande. Les lectures suivantes ont été découpées.
- **LibreOffice** (`C:\Program Files\LibreOffice`) a été exécuté pour mesurer les pages, avec son profil et TEMP sur F:.
- **Livrable** : `LETTRE-4-927-v4.md`, 88 lignes, 1 436 mots de corps (v3 : 1 348). 12 placeholders (v3 : 14), un par ligne.
  13 citations de l'ordre localisées mot pour mot, page exacte, 15 mots au plus. Gate vocabulaire du dépôt : 0 occurrence.
  Aucun nom de fournisseur de données. 0 octet CR. Pages : 3 en 11 pt, 4 en 12 pt.
- **Réviseur** : orchestrateur (R-21). La v4 n'est pas relue G2 : relecture fraîche et acceptation dues avant le dépôt (§8).

## 1. Écarts entre la mission et les faits (déclarés d'abord, preuves rejouables)

- **ÉCART-1 — « les 9 champs mesure fondatrice sont débloqués par seq 2 » (CHANTIERS:1425-1426) : faux sur le servi.**
  - La v3 n'en compte que 7 : `t4_TSLAx_{wkn,we}_{gt1,gt5}`, `window_TSLAx`, `n_TSLAx_wkn`, `n_TSLAx_we`. Les deux champs `gt2`
    ont été retirés en v3.
  - Ces champs portent la part des sessions de TSLAx au-delà de 1 % ou 5 %, par régime, sur la fenêtre fondatrice (cible
    « July 1 to October 31, 2025 »).
  - La publication seq 2 couvre, pour TSLAx, les 4 sessions d'un seul jour de bourse (2026-09-16) : 1 session overnight-weekday,
    0 weekend, 0 holiday (`LECTURES-SERVIES` §3). Une part sur n = 1 vaut 0 % ou 100 %. Le week-end n'a pas de dénominateur.
  - `docs/MESURE-FONDATRICE-bell-2026-09.md` n'existe pas (`ls docs/MESURE-FONDATRICE*` : aucun fichier).
  - La page servie `/bell` rend elle-même ces 7 champs « upcoming » (texte extrait l.118-122).
  - [analyse] Une part de sessions au-delà d'un seuil est calculée à partir du close sous licence. Qu'elle tombe sous la règle
    de mission « aucune valeur dérivée d'une source sous licence » est une lecture du worker, soumise à décision (Needs 1).
    L'issue ne change pas : seq 2 ne remplit pas ces champs, quelle que soit la réponse.
  - Conséquence : champs non remplis, déclencheur inchangé, plus la question licence (Needs 1). `error_origin` proposé :
    orchestrateur (consigne du lot).
- **ÉCART-2 — « 7 champs rapport public en `<DOCS:…>` » : ces champs n'existent pas dans la v3.**
  - Il s'agit de `url_report`, `window_q6`, `volm_{TSLAx,AAPLx,NVDAx,SPYx}` et `crosscheck_SPYx`. Ils figurent dans la liste
    `work-2026-09-23/PLACEHOLDERS-RESTANTS` (v2 bâtie sur le squelette), mais la v3 les a retirés (RENDU-v3 §5, « Retirés (12) »,
    décision 141).
  - Aucune phrase de la v4 ne dépend d'une URL `/docs`, qui répond 404 à 14:02:02Z.
  - Conséquence : **0 placeholder `<DOCS:…>` créé**. Aucun contenu retiré en v3 n'est réintroduit.
- **ÉCART-3 — recompte.** La mission annonce « 14 restants : 4 + 9 + 7 + 1 », ce qui fait 21 (la liste du 23/09 sur la v2 bâtie
  sur le squelette).
  - v3 : 14 = 4 actes investisseur + 7 MESURE + 3 SERVI + 0 REF.
  - v4 : 12 = 4 actes + 7 MESURE + 1 REF (§2).
- **ÉCART-4 — mesure « 3 pages à 12 pt » du 23/09 (FAITS sec.gov l.26, « 509/432/440 ») : c'est un artefact de rendu.**
  - Le moteur `render-v3.mjs` ne traite ligne par ligne qu'un bloc commençant par « Secretary ». Le bloc d'adresse de la v3
    commence par « Via … » : il était donc rendu comme un paragraphe de 2 lignes.
  - Rendu fidèle (`render-v3f.mjs`, une ligne par ligne d'adresse) : la v3 fait **4 pages en 12 pt** (480/446/449/6, la signature
    seule en p.4) et 3 pages en 11 pt.
  - `error_origin` proposé : outillage (moteur de mesure du squelette, non adapté à l'en-tête ajouté le 23/09).
- **ÉCART-5 — « (Helius) » retiré.** La règle de mission « aucun nom de fournisseur de données dans la lettre » l'emporte sur
  D-v3-11.
- **ÉCART-6 — avis de l'advisor intégré, non suivi sur un point.** L'avis proposait de garder une formulation de conception
  « designed to recompute bit for bit ».
  - Deux textes l'excluent tant que le code de rejeu n'est pas exporté : la clause « sinon » du placeholder `url_method` de la v3
    (« retirer « anyone can recompute », « bit for bit » et « with the published replay code » »), et le repli d'I-G2-4
    (G2-TEXTE-v3).
  - Le code de rejeu n'est pas exporté (`/bell/method` l.144 et l.163).
  - Les trois segments sont donc retirés (D-v4-1). Ils sont réversibles à l'export (I-v4-7).

## 2. Placeholders : avant et après

Comptage : `check-v2.mjs` compte 12 occurrences sur 12 lignes (v3 : 14 sur 14).

**Remplis (3), tous SERVI.** Pour chaque GET : code 200, heure lue, sha256 du corps (`LECTURES-SERVIES` §1).

| Placeholder v3 (ligne) | Valeur v4 (ligne) | Preuve | Niveau |
|---|---|---|---|
| `url_state` (l.79) | `https://bell.monarkgate.tech/state.json,` (l.79) | 14:01:25.967Z, 200, `4564701a…08b9` = `state_sha256` de la ligne seq 2 = `bodies_sha256` de `docs/deploy-CA-bell.json` (`8942b973…`, commit `3428dfa`, 12/12). Test non-LLM du chemin servi : `bell-verify.mjs` rejoué, exit 0, `consistent_with_supplied_keyring`, 2 lignes (`LECTURES-SERVIES` §2) | [lu] |
| `url_timeline` (l.80) | `https://bell.monarkgate.tech/timeline.jsonl.` (l.80) | 14:01:25.246Z, 200, `fba1824d…d28b` = miroir étape 13. Chaîne recalculée : sha(l.1) = `prev_line_hash`(l.2) ; sha(l.2) = `line_hash` publié `ef3b06f2…` | [lu] |
| `url_method` (l.82) | `https://monarkgate.tech/bell/method.` (l.82) | 14:02:00.525Z, 200, `35610997…855d` ; conditions du placeholder vérifiées : voir la liste sous le tableau | [lu] |

Conditions du placeholder `url_method` :
- lien vers la clé publique : oui (l.127, `href` effectif) ;
- lien vers les ancres, manifestes et preuves : oui (`/bell/anchors`) ;
- périodes du ratio : oui (l.56, l.69-71) ;
- règle du jour du close : oui (section « reference close day », l.30-35) ;
- validation visuelle de l'investisseur : décision 189, CHANTIERS:1422 ;
- **code de rejeu : non** (l.163 « to be exported ») ⇒ clause « sinon » appliquée (D-v4-1).

**Ajouté (1).** `REF: cong_ssrn` (l.29), sur consigne de mission. Candidat 5937314 : nom du fichier local et note L6 l.1. Il est
absent du texte du papier (SOURCES Q3-8, l.65). Fourni par : l'investisseur (Needs 2).

**Restants (12).** Chacun porte en ligne sa source ; la colonne « Qui » indique qui le fournit.

| # | Placeholder (ligne v4) | Type | Qui le fournit | Déclencheur |
|---|---|---|---|---|
| 1 | `DATE` (l.3) | acte | investisseur (AI-4) | GO de dépôt (Needs 3, 9) |
| 2 | `REF: cong_ssrn` (l.29) | référence | investisseur (Needs 2) | confirmation en un clic ; sinon retrait |
| 3-6 | `t4_TSLAx_{wkn,we}_{gt1,gt5}` (l.33-36) | MESURE | mesure fondatrice (course -b1-bis-ii, `bell-report.mjs --founding`) **et** décision licence (investisseur et orchestrateur) | course terminée et ancrée, item #11 livré, licence tranchée (Needs 1) ; ou variante (b), §3.3 |
| 7 | `window_TSLAx` (l.39) | MESURE | mesure fondatrice | idem |
| 8-9 | `n_TSLAx_wkn`, `n_TSLAx_we` (l.41, l.43) | MESURE | mesure fondatrice | idem |
| 10 | `relation_commerciale` (l.67) | acte | investisseur (AI-5) | date du dépôt (Needs 6) |
| 11 | `contact` (l.84) | acte | investisseur (AI-9) ; candidat servi `bell@monarkgate.tech` | dépôt (Needs 5) |
| 12 | `SIGNATAIRE` (l.88) | acte | investisseur (AI-3) | dépôt (Needs 4) |

Aucun `<DOCS:…>` (ÉCART-2). Aucun placeholder ne porte un close, un ADV ou une valeur dérivée.

## 3. Pourquoi les 7 champs MESURE restent ouverts, et la variante prête

### 3.1 Faits (`LECTURES-SERVIES` §3, [lu] servi 14:01:25Z-14:01:46Z)
- Ligne 2 signée : TSLAx 3 110 fills sur 4 sessions ; AAPLx 2 619 sur 4 ; SPYx 2 244 sur 1. Tous du 2026-09-16 (heure ET).
- Régimes hors séance : 1 overnight-weekday pour TSLAx, 1 pour AAPLx, 0 pour SPYx ; 0 weekend ; 0 holiday.
- Seq 1 (immuable `a828489f…`) : 4 sessions TSLAx, toutes en abstention `no_close_ref`.

### 3.2 Règle
Les champs attendent la mesure fondatrice (placeholder v3 : « course -b1-bis-ii terminée et ancrée, item #11 livré »). La v4
ajoute au déclencheur du premier champ la question licence (E05, lecture [analyse] du worker, §1 ÉCART-1). Les trois autres
champs renvoient à ce déclencheur (« même déclencheur »).

### 3.3 Variante (b), prête et non appliquée
Elle remplace le tableau, sa légende et les 3 placeholders de la légende (lignes 31-44 de la v4) par un paragraphe. Le texte
proposé est en anglais, comme la lettre :

> For the Tesla xStock over September-October 2025, they report deviations beyond 1 percent in 71 percent of weekday-overnight
> hours and 15 percent of weekend hours, and beyond 5 percent in 12 and 0 percent; they also report a 2 percent threshold. Bell
> flags, for each session, whether the deviation exceeds 1, 2 or 5 percent. As of September 24, 2026, its published sessions
> include one weekday-overnight session for each of TSLAx and AAPLx and no weekend session, and no share is reported from them.
> Units, closing-price sources, samples and session definitions differ; any comparison is descriptive.

Sources de la variante :
- valeurs de Cong : SOURCES Q3-6 l.63, [lu+img], Table 4, page PDF 33 ;
- seuils servis : `/bell/method` l.47 ;
- sessions : `LECTURES-SERVIES` §3.

Mesure de la variante (fichier du scratchpad `drafts/v4-variantQ3B.md`, sha `9722c369…625b`) :
- 3 pages en 11 pt, 4 en 12 pt ;
- 1 449 mots ; 5 placeholders, tous à l'investisseur ;
- 13 citations de l'ordre, page exacte.

Vocabulaire de la variante : gate du dépôt « gate:vocab OK » ; `check-vocab-v2.mjs` : 0 hit sur tous les scopes, sauf `harness`
= 1 (pourcentage ; ruling 141) ; liste C-12 identique à la v4.

Elle doit être relue avant le dépôt.

## 3 bis. Décisions du worker (D-v4-n), réversibles et vérifiables

- **D-v4-1** (E03, E08b, E15) : retrait de « designed so that anyone can recompute it », « bit for bit » et « with the published
  replay code ». Motifs :
  - clause « sinon » du placeholder `url_method` de la v3 : le code de rejeu n'est pas lié (`/bell/method` l.144, l.163) ;
  - repli d'I-G2-4 (G2-TEXTE-v3) : l'ensemble des fills n'est pas publié ;
  - G2 O-19 : « anyone » suppose une licence.
  Réversible à l'export du code de rejeu (I-v4-7). Écart avec l'advisor : ÉCART-6.
- **D-v4-2** (E06a) : Q6 « For each session » au lieu de « For each observation window ». Le code BELL-ADV-1 (`collect.ts`
  l.211-231) et l'état servi calculent un ratio par session ; la formulation de la v3 décrivait l'ancien calcul (RENDU-v3 V3-5).
- **D-v4-3** (E06b, E08b) : « consolidated » retiré pour l'ADV seulement, gardé pour le close. I-G2-5 est ouvert (ADR-B0 l.242,
  l.296, déclencheur « avant le remplissage de la lettre ») ; application du repli de G2 O-20. Réversible si I-G2-5 est établi
  avant le dépôt.
- **D-v4-4** (E12) : « including other symbols and the holiday regime » retiré de l'introduction du §5. Aucune session holiday
  n'est servie (seq 1 et seq 2, `LECTURES-SERVIES` §3). La condition du placeholder `url_state` n'est pas remplie pour ce segment.
- **D-v4-5** (E19, E20, E09) : trois faits servis ajoutés. Ce sont des comptes (fills, sessions, abstentions) et une description
  de méthode (relecture du close sur une seconde source). Aucun close, aucune valeur dérivée, aucun fournisseur. Sources :
  timeline l.2 signée, états `4564701a…` et `a828489f…`, `/bell/method` l.37-38. Chacun est retirable sans autre retouche ; en
  12 pt, ce sont les premiers candidats à la coupe (E19 : 27 mots ; E09 : +25 mots nets ; E20 : +5 mots).
- **D-v4-6** (E10) : la démonstration « Signed and chained digests » est scindée en deux.
  - Timeline : signée, chaînée, portant les digests des fichiers publiés. Ancrage des publications « in preparation »
    (décision 192).
  - Journaux de la contre-vérification : la phrase est bornée à « the enumeration run described above » (Q6-ANCHOR-1,
    option (b)) ; la clause « not checked against a node » est ajoutée (C-2) ; le « 15 of 15 … on 2026-09-23 » dépassé est
    remplacé.
  - Note pour la relecture : le registre servi compte 17 lignes, dont 16 avec preuve (`/bell/anchors` l.7). La 17ᵉ
    (2026-09-22 14:45:45, `mint_resume` TSLAx) n'a pas de preuve, car le même digest de manifeste est horodaté sur la ligne de
    14:46:26 (`/bell/anchors` l.12 ; accepté par G2-TEXTE-v3 1-21). D'où « all 16 proof files ».
- **D-v4-7** (E02, E17, E18, E01) : les placeholders d'actes portent leur source en ligne et le bandeau est rendu exact
  (G2 O-1). Le candidat `bell@monarkgate.tech` est inscrit dans `contact`.
- **D-v4-8** (E05) : la question licence est portée dans le déclencheur des champs `t4`, sous forme de question (lecture
  [analyse] du worker).
- **D-v4-9** (mesure) : le moteur de rendu est corrigé pour mettre le bloc d'adresse ligne par ligne (`render-v4f.mjs`,
  `render-v3f.mjs`) ; ÉCART-4.

## 4. Modifications v3 → v4 : phrase, source, raison

Toutes les modifications sont des substitutions exactes par `apply-v4.mjs`. Chacune exige une occurrence unique du texte de la v3.
Hunks du diff : l.1, 3, 15, 27, 29, 33, 48, 56, 61-64, 78-82, 84, 88 (`work-2026-09-24/DIFF-v3-v4.md`). Les autres lignes sont
identiques à l'octet.

| Id | Ligne | v4 (extrait) | Source | Raison |
|---|---|---|---|---|
| E01 | 1 | bandeau v4 : « each one names its source, and RENDU-v4.md lists its trigger and who provides it » | G2-TEXTE-v3 O-1 | le bandeau v3 était faux pour DATE et SIGNATAIRE |
| E02, E18 | 3, 88 | `DATE` et `SIGNATAIRE` avec source en ligne | NOTE-DEPOT AI-3/AI-4 | O-1 |
| E03 | 15 | « …closed, and publishes its method. » (retrait de « designed so that anyone can recompute it ») | `/bell/method` 200 | clause « sinon » de `url_method` ; G2 O-19 (D-v4-1) |
| E19 | 27 | « As of September 24, 2026, Bell's latest publication covers sessions of September 16, 2026 for TSLAx, AAPLx and SPYx, from 3,110, 2,619 and 2,244 on-chain fills respectively. » | timeline l.2 signée, `runs[].records[].n_fills` ; `session_date_et` ; sommes par session | fait nouveau de la mission ; dit la taille réelle de l'échantillon publié (D-v4-5) |
| E20 | 29 | « P_close the last consolidated closing price, cross-read on a second source » | `/bell/method` l.37 ; `cash_cross` servi (9 sessions sur 9) | méthode décrite, aucun fournisseur nommé, aucune valeur (D-v4-5) |
| E04 | 29 | `(<<REF: cong_ssrn …>>, December 2025, p. 32)` | consigne de mission ; SOURCES Q3-8 | réintroduction (G2 O-16) |
| E05 | 33 | déclencheur du premier champ `t4` + question licence, posée comme question (lecture [analyse] du worker) | règle de licence transmise par la mission | ÉCART-1 |
| E06a | 48 | « For each session, Bell publishes the ratio » (au lieu de « For each observation window ») | `collect.ts` l.211-231 (une entrée de volume par session) ; `digest.volume[]` servi ; `/bell/method` l.69 | correction factuelle : le code a été aligné (BELL-ADV-1), la v3 décrivait l'ancien calcul (D-v4-2) |
| E06b | 48 | « …average daily share volume in the calendar month before the session date. » | chaîne `formula` servie ; `adv_period` 2026-08 pour la date 2026-09-16 ; `/bell/method` l.56, l.71 | période explicite, conforme au « prior month » de II.F. « consolidated » retiré pour l'ADV : I-G2-5 est toujours ouvert (ADR-B0 l.242, l.296) ; repli de G2 O-20 (D-v4-3) |
| E07 | 56 | « *Signed and chained digest.* Publications are signed and hash-chained, each publication carrying the digest of its content and of the previous line, so that a later edit is detectable by recomputation with the published public key. » | décision 192 (formule reprise mot pour mot) ; item SEC-L56-ANCHOR-1 (ADR-BELL-OTS-ANCHOR-1 l.309) | aucune preuve de publication ne porte de bloc Bitcoin (la preuve seq 2 est pendante, 0 bloc, relue à 14:36Z) |
| E08a | 61 | « (Helius) » retiré | règle de mission | ÉCART-5 |
| E08b | 61 | « With the same closing price and daily share volumes, … each gap and ratio can be recomputed with the formulas of Bell's published method. » | `/bell/method` (formules, périodes, « What you bring ») | retrait de « bit for bit » et de « with the published replay code » (clause « sinon », I-G2-4) ; « consolidated volume » remplacé (I-G2-5) (D-v4-1, D-v4-3) |
| E09 | 62 | « …: in its publication of September 23, 2026, all four TSLAx sessions abstained with no_close_ref, a missing closing price; in that of September 24, a gap is computed for each of its nine sessions. » | `states/a828489f….json` (4 × `no_close_ref`) ; `state.json` seq 2 (9 écarts calculés, aucune abstention) ; `/bell/method` l.38 | l'exemple hypothétique de la v3 devient un fait servi, sans valeur sous licence (D-v4-5) |
| E10 | 63 | « *Signed and chained digests.* » : timeline chaînée, chaque ligne portant les digests des fichiers publiés, signée Ed25519, clé publiée ; « Timestamp anchoring of these publications is in preparation. » ; journaux de « the enumeration run described above » chaînés, manifeste soumis à OpenTimestamps à chaque début, fin et reprise ; « as of September 24, 2026, all 16 proof files record a Bitcoin block (not checked against a node) » ; limite de l'ancre | clés de ligne et vérification (`LECTURES-SERVIES` §2) ; `/bell/anchors` l.7 ; `ots-heights` 16/16 ; commit `13a9aed` ; ADR-BELL-OTS-ANCHOR-1 l.222, l.305-306 ; décision 192 | alignement sur la propriété (c) reformulée ; phrase bornée à la contre-vérification (Q6-ANCHOR-1 option (b)) ; clause nœud (C-2) ; « 15 of 15 … 2026-09-23 » dépassé (D-v4-6) |
| E11 | 64 | « each ratio is published with its session window and the month of its denominator » | `digest.volume[].window` et `adv_period` servis | la démonstration colle à la propriété (d) |
| E12 | 78 | « State and timeline: » (retrait de « including other symbols and the holiday regime ») | aucune session holiday servie (seq 1 et seq 2) | condition du placeholder `url_state` non remplie pour holiday (D-v4-4) |
| E13, E14, E16 | 79, 80, 82 | trois URL servies | §2 | remplissage |
| E15 | 81 | « …, with the public key and the anchors: » (retrait de « and the replay code ») | `/bell/method` l.163 | D-v4-1 |
| E17 | 84 | `contact` : candidat servi ajouté dans le placeholder | `/bell/method` l.191 ; `/bell` l.190 | aide à l'acte AI-9 |

Style : aucune date ISO dans le corps (O-13 de G2 réglé par E10). Aucun « will », aucun « first », aucun « guarantee ». Aucune
probabilité. « As of September 24, 2026 » accompagne chaque fait daté.

## 5. Phrases au présent et chemin servi (règle Branchement, NOTE-DEPOT C-4)

Test d'intégration non-LLM du chemin servi : le vérificateur côté lecteur `bell-verify.mjs` a été rejoué sur les corps GET du jour.
Il contrôle la chaîne, chaque signature, la liaison de l'état et de la provenance à la ligne de tête, et les immuables : exit 0,
`consistent_with_supplied_keyring`. S'y ajoute la CA de déploiement seq 2 committée (12/12, `3428dfa`).

| Phrase v4 | Chemin servi | État le 2026-09-24 |
|---|---|---|
| « keeps a public, signed record » ; « chained line by line, each line carrying the digests … signed with an Ed25519 key whose public half is published » | `timeline.jsonl`, `bell/pubkey.json` | servis (200), vérifiés |
| « publishes its method » ; « by a published rule » ; « the formulas of Bell's published method » | `/bell/method` | servi (200), validé par l'investisseur (189) |
| « Bell publishes g = … cross-read on a second source » ; « a gap is computed for each of its nine sessions » | `state.json` seq 2 | servi |
| « Bell publishes the ratio … calendar month before the session date » ; « each ratio is published with its session window and the month of its denominator » | `state.json` (`digest.volume[]`) | servi (valeurs non rendues sur le site ; présentes dans l'état) |
| « counts abstentions in its published state file » ; « all four TSLAx sessions abstained with no_close_ref » | `state.json` (`residuals`) ; `states/a828489f….json` | servis |
| « all 16 proof files record a Bitcoin block (not checked against a node) » | `/bell/anchors` (manifestes et preuves) | servi (200) |
| « Bell's records are published from a dedicated host operated by MONARK; the signing key is generated on it » | hôte servi ; `/bell/method` l.133 | servi ; affirmation de procédure lue sur la page |
| « Timestamp anchoring of these publications is in preparation » | registre `docs/bell-publications/ANCHORS.md` (non servi) ; preuve pendante | vrai comme préparation ; aucune affirmation d'ancrage |

La lettre ne dit jamais « built », « live » ni « anchored to a public timestamp » (grep : 0).

## 6. Contrôles rejoués sur la v4 finale (sha `788239ca…2db2`)

1. **Citations** (`check-v2.mjs`, copie du harnais v3, sha `0b266bc4…71de`) : 14 spans. Ce sont 13 citations de l'ordre, chacune
   localisée mot pour mot dans le texte pré-extrait (`adee69f6…4d08d`, recalculé), avec une page citée égale à la page réelle et
   15 mots au plus. S'y ajoute « Tokenized Stocks » (titre, non-citation attendue). 0 écart de page. Liste identique à la v3.
2. **Vocabulaire** :
   - gate du dépôt `node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v4.md` : « gate:vocab OK — scanned 268 file(s) »,
     exit 0 (267 fichiers sans l'argument : la lettre est bien lue) ;
   - `check-vocab-v2.mjs`, tous les scopes : 0 partout sauf `harness` = 5 (les mêmes 5 pourcentages que la v3 : seuils du tableau et
     « 2 percent ») ; ruling 141 inchangé ;
   - liste C-12 : 0 « attestation » (la v3 en avait 1), 0 « first », 0 « verified », 0 « guarantee », 0 « probability » ;
     « only » ×1 restrictif ; « certif » ×1 en négation ; « independen » ×1 (revendication de Bell).
3. **Fournisseurs** : grep `helius|chainstack|databento|massive|polygon|nasdaq|pyth|raydium|jupiter|orca|meteora|yahoo|hostinger|caddy|let.s encrypt|kraidle|coinbase|kaiko|talos`
   sur tout le fichier : 0.
   **Occurrences dans les fichiers internes, jugées** (ce rendu, `LECTURES-SERVIES`, `DIFF-v3-v4`) :
   - la ceinture `env -u HELIUS_API_KEY -u CHAINSTACK_* … -u POLYGON_API_KEY -u DATABENTO_API_KEY` (noms de variables
     d'environnement) ;
   - l'expression de grep ci-dessus ;
   - la mention « (Helius) retiré » (ÉCART-5, E08a) ;
   - la ligne `-` de la v3 dans le diff.
   Aucune n'est dans la lettre. Les deux nombres décimaux de `DIFF-v3-v4.md` (l.10-11) sont les heures de modification des
   fichiers dans l'en-tête du diff, pas des valeurs de marché. Aucun gT, drapeau de seuil, VWAP, volume de base ni vol_ratio dans
   les fichiers du dépôt écrits par le worker (grep `[0-9]+\.[0-9]{4,}` : seules ces deux heures).
4. **Cuisine interne** : corps sans placeholders ni bandeau, grep `orchestrat|checkpoint|lot|worker|G[0-9]|validat|agilegates|opus|sonnet|fable|claude|error_origin|verdict|CHANTIERS|RENDU|ADR` :
   0. Dans les placeholders internes (retirés avant dépôt) : « orchestrateur » ×1, `CHANTIERS:1426`, `RENDU-v4` ×2, `ADR-T1aii` ×2.
5. **Pages** (`render-v4f.mjs` : moteur v3 plus bloc d'adresse ligne par ligne ; LibreOffice local, profil sur F:) :
   - v4 : 12 pt / 1,15 ⇒ 4 pages (479/433/500/56) ; 11 pt / 1,15 ⇒ **3 pages** (569/570/332, environ 40 % de la p.3 libre au
     rendu-image) ; 11 pt / 1,05 ⇒ 3 pages ;
   - calibration v3 : 12 pt ⇒ 4 pages (480/446/449/6) ; 11 pt ⇒ 3 pages (549/569/264) ;
   - moteur v3 non corrigé sur la v3 : 3 pages (509/432/440), identique à FAITS sec.gov l.26 (ÉCART-4).
6. **Forme** :
   - tableau GFM conforme (`check-md-tables.mjs` : 1 tableau, 0 ligne fautive) ;
   - 0 octet CR ; LF final présent ; 0 caractère non ASCII dans le corps hors placeholders ;
   - 0 nombre décimal à 4 chiffres ou plus ; 0 « vwap ».
7. **Diff** v3 → v4 : 12 blocs en format `diff` normal, 6 hunks en format unifié (`DIFF-v3-v4.md`).
8. **Intacts** : `git diff --quiet -- docs/sec-4927` est vrai (aucun fichier suivi modifié), et les sha sont identiques à ceux des
   rendus précédents :
   - v3 `47bf075e…1a17` ;
   - v2 `01de804a…be6d` ;
   - squelette `3f27e46b…c239c` ;
   - SOURCES `463f3738…040b` ;
   - NOTE-DEPOT `c09ef74e…cfa0`.

## 7. Sources lues (niveau, empreinte, portée)

| Source | sha256 | Portée | Niveau |
|---|---|---|---|
| `LETTRE-4-927-v3.md` | `47bf075e…1a17` | intégral | [lu] |
| `RENDU-v3.md`, `G2-TEXTE-v3.md` | `ebfa8fa7…a822`, `1e65d14f…ad49` | intégral | [lu] |
| `SOURCES.md`, `NOTE-DEPOT.md`, `AVIS-advisor-marche-v2.md` | `463f3738…040b`, `c09ef74e…cfa0`, `e2806cdf…ae00` | intégral | [lu] (avis : ses [abs-WF]/[2nd] non repris) |
| `FAITS-sec-gov-…-2026-09-23.md`, `FAITS-lettre-ross-…` | `6a2c89e9…be60`, `a6dee725…04de` | intégral | [lu] (contenu [lu-orch]) |
| `work-2026-09-23/PLACEHOLDERS-RESTANTS-2026-09-23.md` | `d14a2a30…9948` | intégral | [lu] |
| `docs/CHANTIERS.md` | `af60fac1…ab6c` (HEAD `84add61`) | l.46, 55, 104, 112, 159, 915, 916, 921, 941, 992, 1016, 1018, 1029, 1031, 1037, 1039, 1047, 1074, 1171, 1230, 1345, 1355, 1381, 1422-1426 et l'entrée 14:17 UTC | [lu] |
| `docs/JOURNAL-PROVENANCE.md` | `9fd216f1…f3d1` | l.370-393 (D-n seq 2, ancre 13:37) | [lu] |
| `docs/adr/ADR-B0-programme-bell.md` | `f42f8b3f…a885` | l.28, 30, 241-242, 296 | [lu] |
| `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` | `de10502d…2a0d` (HEAD `84add61`) | l.32, 69, 86, 222, 236, 292, 305, 306, 309, 317, 327, 355, 362, 368 | [lu] |
| `apps/bell/src/collect.ts` | `4eb82713…b829` (commit `3bda2ca`) | l.205-236 | [lu] |
| `apps/bell/scripts/bell-verify.mjs`, `bell-chain.mjs`, `keys/bell-keyring.json` | `14a7e07c…4e8b`, `521270a3…6ce7`, `beec868a…ef81` | en-tête, CLI ; exécution | [lu] + rejeu |
| `docs/deploy-CA-bell.json` | `8942b973…b396` (commit `3428dfa`) | résumé (12/12, TLS, `bodies_sha256`) | [lu] |
| `docs/course-bell/*.ots` (16), `docs/bell-publications/*` | `LECTURES-SERVIES` §2 | octets (tags d'attestation) | [lu] (pas une vérification cryptographique) |
| 12 GET publics | `LECTURES-SERVIES` §1 | corps entiers, textes extraits | [lu] |
| Ordre 34-106402 (texte pré-extrait) | `adee69f6…4d08d` | localisation des 13 citations | [lu] |

Aucune source [2nd] nouvelle, aucun chiffre de marché, aucune lecture bibliographique nouvelle. Les valeurs de Cong reprises dans la
variante (b) sont celles de la v3 (SOURCES Q3-6, [lu+img]).

## 8. Items formés (propriétaire et déclencheur ; aucun dû nu)

| # | Item | Propriétaire | Déclencheur |
|---|---|---|---|
| I-v4-1 | Relecture G2 texte de la v4 (instance fraîche, `check-v2`, `grep-forbidden`, pages, delta v3→v4), puis acceptation par le validateur. **Relecture des faits datés le jour du dépôt** : E19 (dernière publication = seq 2), E09 (9 sur 9, `no_close_ref` 0), E10 (16 sur 16, ancrage des publications « in preparation »). Refaire les GET, `state-safe`, `ots-heights` sur `docs/course-bell` **et** `docs/bell-publications`. Mettre E10 à jour si la preuve de publication porte un bloc, ou si une seq 3 est publiée | orchestrateur | avant tout dépôt |
| I-v4-2 | CHANTIERS:1425-1426 dit que seq 2 débloque 9 champs : corriger avec la preuve de l'ÉCART-1 | orchestrateur | prochaine écriture de CHANTIERS |
| I-v4-3 | Mesure des pages : utiliser `render-v4f.mjs` ou tout moteur qui rend le bloc d'adresse ligne par ligne. Consigner que la v3 faisait 4 pages en 12 pt (ÉCART-4) | orchestrateur | re-mesure au remplissage (I-v3-6) |
| I-v4-4 | I-G2-5 toujours ouvert (base « consolidated » de l'ADV). La lettre a retiré le mot. `/bell/method` l.53-55 et « What you bring » disent encore « consolidated share volumes » : cohérence du site | orchestrateur (vitrine) ; chercheur pour la lecture primaire | avant le dépôt si l'on veut remettre « consolidated » dans la lettre ; sinon prochain lot vitrine |
| I-v4-5 | **Plausibilité d'une ligne SPYx de seq 2** (session régulière du 2026-09-16). L'écart servi est hors de l'ordre de grandeur des lignes TSLAx et AAPLx pour un traceur d'indice en séance. Valeur non reproduite (règle de licence) ; voir la page `/bell`, ligne SPYx. À contrôler avant le dépôt, puisque la lettre renvoie à `state.json` : cotation du pool, multiplicateur, jour de référence | orchestrateur | avant le dépôt |
| I-v4-6 | SOURCES.md et NOTE-DEPOT.md : SOURCES §B l.113 (« aucun fournisseur nommé ») redevient exact ; NOTE-DEPOT C-9 (SSRN) redevient actif ; les phrases nouvelles de la v4 ont leur source au §4 de ce rendu (addendum) | orchestrateur | prochaine révision de SOURCES |
| I-v4-7 | Rétablir « bit for bit » et « designed so that anyone can recompute it » quand le code de rejeu est exporté (`url_replay`) et que le registre des fills est publié (I-G2-4) | orchestrateur | export `apps/bell` |
| I-v4-8 | Option : élargir la démonstration « Named abstention » au ratio (`no_adv`, `no_multiplier`). I-G2-1 semble livré (`collect.ts` l.211-236 ; `/bell/method` l.60, l.84-85) ; ruling C-G2-1 | orchestrateur | G2 texte v4 |
| I-v4-9 | Q6-ANCHOR-1 (ADR-BELL-OTS-ANCHOR-1 l.305) : l'option (b), phrase bornée à la contre-vérification, est appliquée par E10 ; l'item peut être clos pour la lettre | orchestrateur | G2 texte v4 |
| I-v4-10 | SEC-L56-ANCHOR-1 : appliqué (formule de la décision 192) ; revoir la démonstration de Bell (E10) quand la preuve de publication porte un bloc | orchestrateur | mise à niveau de `timeline-seq2-manifest.txt.ots` |
| I-v4-11 | Lettres du dossier 4-927 (I-v2-11, NOTE-DEPOT C-8) : 3 lues sur 14 au 22/09 ; relire le dossier à jour, sur place | orchestrateur (lecture sur place) | avant le dépôt |
| I-v4-12 | BELL-OTS-NODE-VERIFY-1 : condition de dépôt selon l'ADR ; option et coût à décider par l'investisseur (Needs 8) | investisseur, puis orchestrateur | avant le dépôt, ou levée explicite |

**Observations** (sans action sur la lettre) :
- La page `/bell` écrit « written so that anyone can recompute it » et porte un badge « built ». La lettre ne le dit plus (D-v4-1).
  La cohérence du site relève de la vitrine.
- `/bell/method` l.144 dit que le vérificateur, le publieur, la bibliothèque de chaîne et le trousseau sont dans le dépôt public.
  github.com est hors des hôtes autorisés : ce point n'a pas été lu, et la lettre ne l'affirme pas.

## 9. Empreintes (sha256)

- `docs/sec-4927/LETTRE-4-927-v4.md` : `788239cafd8e570719c483ac1a49c317838c7639ff042157eb1563175dc52db2`.
- `docs/sec-4927/work-2026-09-24/LECTURES-SERVIES-2026-09-24.md` et `DIFF-v3-v4.md` : valeurs dans le message de rendu (calculées
  après la dernière écriture).
- Ce fichier : un fichier ne peut pas porter son propre sha256 ; valeur donnée dans le message de rendu.

Scratchpad `…\scratchpad\sec4927-v4\` :

| Fichier | sha256 |
|---|---|
| `apply-v4.mjs` | `eef012db4cc07fb4b9aa401fd144d8b8afa8fb79c3455519d95d7ac19ba3eb30` |
| `get.sh` | `6df8f8ae6bfd905a60a039c30bc01ac51ddde9c6b9620e8d0a3ce96b91930b1c` |
| `get/reads.log` | `08e110cc4f7a80aa4e19e99cf00a1380326c17ae9381ac56435de2c0abf604d5` |
| `html2text.mjs` | `e741ed6c7462a0c84adee0a2544627f03159b964bf5a588bfac4af24f8bf32e1` |
| `state-safe.mjs` | `bc75a4e3d5b0f08840fbfa5e99e31991cbf5bb219377762fa3609c5477030ac0` |
| `verify-out.json` | `814b5794f4243c2c0bc0d6fbb150f819afb0940dcca47e4c51dd4ef9ce2712f1` |
| `variant-q3b.mjs` | `9fa28f6a0fd8fc11ac9d5f704acc12ad6204c6120a46d36ea081d54abcf55164` |
| `write-diff-md.mjs` | `d704455a077c4c99ee989fe183c11f019cd2148f1eb06f45d638e67d0df609d4` |
| `h/render-v4f.mjs` | `f4eccc2fbc234f33015be833500ab67f5c12b3ed7cc5625f405ba2396b24585f` |
| `h/render-v3f.mjs` | `8510f73ae0995fe99fe7b0ac34cb07d43f101552eaf1fa66b7ad500401a3c231` |
| `h/measure-v4.sh` | `f8465eff99dfd642c46546d5731a3a178a0b57e1349881eb3b5a6a7ec580e29e` |
| `pages/v4final2-22-253.pdf` | `8aad3a326ae5adff2b82455f8638e9653096c03228e2fa1f65273f5b9415d58b` |
| `pages/v4final2-24-276.pdf` | `b82265e8a92d7a4743d23406e728ba7bb530efb41153ad3b97602772ca782e76` |
| `pages/cal-v3f-12pt.pdf` | `073f6a9c306b57233c72962ee460ef37d09078625111346cf4c6e8690d746361` |

Copies des harnais de la v3, identiques à l'octet aux originaux de `F:\tmp\claude\F--Monark\7a32969b-…\scratchpad\` :
- `h/check-v2.mjs` `0b266bc4…71de` ;
- `h/check-vocab-v2.mjs` `ed1834f0…6cfc` ;
- `h/check-md-tables.mjs` `71990eb8…c4af` ;
- `h/wordcount.mjs` `82ace497…4fac` ;
- `h/section-words.mjs` `4066aa01…49dd` ;
- `h/ots-heights.mjs` `f9102749…aa7c5`.

## 10. Journal (horloge)

- 14:00:01Z — Début. Lectures d'entrée intégrales : v3, PLACEHOLDERS-RESTANTS, SOURCES, G2-TEXTE-v3, RENDU-v3, NOTE-DEPOT, AVIS,
  les deux FAITS, JOURNAL-PROVENANCE (seq 2), CHANTIERS (192).
- 14:01:25Z à 14:02:02Z — 12 GET. Puis texte extrait, recensement sans valeur sous licence, `bell-verify` exit 0, chaîne
  recalculée, `ots-heights`, code BELL-ADV-1.
- Entre 14:02:02Z et 14:31:14Z — **Consultation de l'advisor intégré**, avant toute rédaction (conseil, jamais verdict).
  - Apport : ÉCART-1 et ÉCART-2 confirmés ; recompte 14 → 12 ; liste d'éditions ; règle de licence étendue au rendu et au
    répertoire de travail ; clause nœud ; démonstration seq 1 / seq 2.
  - Suivi : tout, sauf « designed to recompute bit for bit » (ÉCART-6). Ajouts hors avis : ÉCART-4 (artefact de mesure), E06b sans
    « consolidated » (I-G2-5), variante (b), I-v4-5.
- Brouillons v4a à v4f, mesurés à chaque itération (4 pages en 12 pt). Découverte de l'artefact de mesure et correction du moteur.
  Le format est laissé à l'investisseur (Needs 7).
- 14:31:14Z — v4 écrite (sha `ea9f6cf6…`). 14:34:44Z — répertoire de travail créé. 14:36:09Z — HEAD `84add61` constaté ; la
  preuve de publication seq 2 est relue pendante. 14:38:36Z — empreintes du scratchpad, puis rédaction de ce rendu.
- 14:41:58Z — livrables durables. **Consultation finale de l'advisor intégré** (conseil, jamais verdict), qui a relevé cinq
  défauts de provenance du rendu :
  - D-v4-n cités mais non définis ⇒ §3 bis ;
  - 17ᵉ ligne du registre ⇒ note sous D-v4-6 ;
  - occurrences de fournisseurs non jugées ⇒ §6.3 ;
  - lecture licence attribuée à la mission ⇒ marquée [analyse], Needs 1 et placeholder E05 posés en question ;
  - faits datés ⇒ I-v4-1.
  S'y ajoutent le vocabulaire de la variante et une abréviation de sha. Tout est suivi. La lettre ne change qu'à l'intérieur du
  placeholder `t4_TSLAx_wkn_gt1` (E05) ; le corps anglais est inchangé. Nouvelle v4 : sha `788239ca…2db2`. Tous les contrôles
  du §6 ont été rejoués sur ce sha, avec des résultats identiques.

## 11. Rejeu (R-21)

`<sp>` = `F:\tmp\claude\F--Shogen\90684fb2-4e7b-42e9-b820-f042dc4465f3\scratchpad\sec4927-v4`. Toutes les commandes node passent
sous la ceinture `env -u …`.

- **Construction** : `node <sp>/apply-v4.mjs F:/Monark/docs/sec-4927/LETTRE-4-927-v3.md <sortie>` (sortie identique à la v4 :
  comparer les sha).
- **Citations et forme** :
  - `node <sp>/h/check-v2.mjs <v4>` ; `node <sp>/h/check-md-tables.mjs <v4>` ;
  - `node <sp>/h/wordcount.mjs <v3> <v4>` ; `node <sp>/h/section-words.mjs <v4>` ;
  - `tr -cd '\r' < <v4> | wc -c`.
- **Vocabulaire** : `cd F:/Monark && node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v4.md` ;
  `node <sp>/h/check-vocab-v2.mjs <v4>`.
- **Pages** : `bash <sp>/h/measure-v4.sh <sp>/h/render-v4f.mjs <v4> x 22 253` (puis `24 276`, `22 231`) ; calibration
  `… render-v3f.mjs <v3> y 24 276`.
- **Servi** :
  - `bash <sp>/get.sh <url> <fichier>` pour les 12 URL de `LECTURES-SERVIES` §1 ;
  - `node F:/Monark/apps/bell/scripts/bell-verify.mjs --dir <sp>/mirror --keyring F:/Monark/apps/bell/keys/bell-keyring.json` ;
  - `node <sp>/state-safe.mjs <sp>/mirror/state.json` ;
  - `node <sp>/h/ots-heights.mjs F:/Monark/docs/course-bell`.
- **Variante** : `node <sp>/variant-q3b.mjs <v4> <sortie>`.

Aucun commit (R-20), aucun workflow, aucune écriture hors des trois cibles autorisées et du scratchpad (sauf l'incident C:
déclaré au §0).
