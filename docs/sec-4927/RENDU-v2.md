Modèle résolu : claude-opus-5-5[1m]

# RENDU-v2 — lettre de commentaire SEC File No. 4-927 (MONARK Bell), version 2

(R-1 : préfixe attendu `claude-opus-5-5` — à vérifier par l'orchestrateur avant consommation.)

**Provenance** : worker `claude-opus-5-5[1m]`, effort max, 2026-09-23 (horloge `date -u` : premier relevé 05:00:53Z, dernier relevé
avant la clôture 05:36:05Z) ; contexte : mission orchestrateur « DOCS — lettre 4-927, v2 », décisions investisseur 138 et 139 ; réviseur :
orchestrateur (R-21). **Mode** : docs-only ; écritures limitées à `F:\Monark\docs\sec-4927\LETTRE-4-927-v2.md` et à ce fichier, plus le
scratchpad de session (harnais) ; squelette `LETTRE-4-927-squelette.md` NON modifié (sha256 `3f27e46b…c239c` avant et après) ; aucun
commit, aucun workflow (R-20) ; aucun appel réseau (aucune WebFetch faite). Dépôt lu : `F:\Monark` HEAD
`38c767e017a4abb3e8e4137b53d0acb4e9bde90a` (`lot/etude-suite`, arbre propre hors mes deux fichiers ; le HEAD a avancé pendant la mission
à `ec68fdf9c40b071b6ddcb59945234c7243d1f84a` par des commits orchestrateur : parmi les fichiers cités, seul `docs/CHANTIERS.md` change,
+12 lignes APRÈS la l.979, hunk `@@ -977,3 +977,15 @@` ⇒ toutes les lignes citées, ≤ l.964, sont stables) ; arbre d'exécution épinglé des
tirages `F:\Monark-wt-bellexec` HEAD `a703e2449d39908c4f4f417e350c437d9f8f0bcc` (propre, lecture seule) ; répertoires de course TERMINÉS
`F:\course-bell\bell-b3d-run-{tslax,aaplx,nvdax}-completion` (lecture seule).

## 0. Livrables et état en une ligne
- `F:\Monark\docs\sec-4927\LETTRE-4-927-v2.md` — sha256 `01de804a6af2678beceb7f9318c139803a5733b3b9f5a7d966d122db3d71be6d`, 103 lignes,
  anglais, 1 661 mots de corps (hors bandeau et placeholders ; squelette 1 557 par la même méthode, delta +104), 26 placeholders
  `<<…>>` (un par ligne : `grep -c '<<'` = 26 = `grep -o '<<' | wc -l`), 0 octet CR, 15 citations de l'ordre localisées mot pour mot
  avec page concordante (max 17 mots) + le titre du papier de Cong, **3 pages** mesurées en Times 11 pt (interligne 1,05 et 1,15), 4 en
  12 pt ; gate vocabulaire du dépôt : **0 hit** (exit 0).
- Ce fichier (auto-référence : sha256 donné dans le message de rendu).

## 1. Journal (au fil de l'eau)
- [~04:4xZ-05:00Z] Lectures d'entrée intégrales : squelette, SOURCES, NOTE-DEPOT, RENDU (v1), FAITS-lettre-ross ; CHANTIERS (décisions 69
  l.212/l.223, 138 l.915, 139 l.921 ; l.55, l.119-123, l.838, l.898, l.941, l.964) ; ADR-T1aii l.1-606 intégral (dont D1-nonies
  l.397-606) ; ANCHORS ; FAITS floor-helius n3 ; FAITS near-ondo ; FAITS opentimestamps ; RUNBOOK supervision ; vocab-banned.json ;
  `scripts/grep-forbidden.mjs` ; `apps/bell/scripts/bell-report.mjs` ; code du crosscheck à `a703e24` (rebase-crosscheck.ts l.1-64,
  l.120-345 ; operators.ts ; rebase-scan.ts l.109-114) ; ADR-B0 l.21-135 ciblé ; residuals.ts l.10-50 ; volume.ts l.1-50 ; gap.ts l.60-110.
- [05:00Z] Vérifications de première main AVANT rédaction (§3, V-1..V-11 ; V-12 ajouté à la revue finale) ; RENDU-v2 initial écrit (durable) ; advisor intégré consulté
  (conseil, pas verdict) : trois prémisses de la mission à corriger (quorum page à page, OTS horodaté au présent, Q6 depuis go-1),
  cadrage des N_exact (transactions du MINT, pas de négociation), pièges placeholders/tableau/gate — tous suivis (§6).
- [05:0xZ] Première écriture de la lettre : l'outil Bash a échoué sur un heredoc long (« unexpected EOF », cause non isolée ; deux
  heredocs de test courts passent) ⇒ lettre écrite par l'outil Write (repli licite), CR vérifiés à 0 par `tr -cd '\r' | wc -c`
  (un `grep -c $'\r'` dans une substitution de commande a rendu un faux 106 : artefact d'outillage, écarté).
- [05:0xZ-05:15Z] Harnais v2 (`scratchpad/v2/`) : citations + pages, mots, placeholders, tableau ; défauts trouvés et corrigés :
  (a) citation « the steps … » rattachée par erreur à p. 23 ⇒ citations séparées ; (b) quatre placeholders contenaient « > »
  (casse l'analyse `<<[^>]*>>`) ⇒ « supérieur à » ; (c) mot « attestation » dans un placeholder ⇒ reformulé ; (d) longueur 4 pages à
  1,15 ⇒ trois séries de coupes (§5, F-9) ; (e) relecture adversariale propre : 8 corrections de fidélité (§5, F-10).
- [05:20Z] Contrôles rejoués (§8) ; ce fichier complété ; livrables durables AVANT la revue finale.
- [05:2xZ] **Advisor intégré, revue finale** (conseil, pas verdict) — 4 points, tous traités : (1) BLOQUANT : procédure 135(a) non
  déclarée (les trois fins de mint ont été tirées sous `--allow-short-pages`, `budget.json` `require_full_pages:false`, hashé dans un
  manifeste d'ancre) ⇒ V-12 ajouté + phrase de la puce « Complete pages » complétée (F-11, D-v2-11) ; (2) queue de sha de FICHE-GO-1
  fausse ⇒ corrigée (§10) ; (3) format Q3 : `bell-report.mjs` rend 2 décimales (`pct`, l.72) ⇒ arrondi déclaré dans le placeholder
  (F-13) ; (4) coupes 12 pt insuffisantes ⇒ dit tel quel (§8 C-5). Points jugés non bloquants par l'advisor et laissés : retrait de la
  phrase « independent » (réversible, I-v2-5), `\|` dans les cellules, endpoint Solana + PR-v2-1, Cong sans id SSRN.
- [05:34Z] Contrôles finaux rejoués sur la lettre finale (§8) ; HEAD du dépôt constaté à `ec68fdf` (voir Provenance).

## 2. Corrections I-1..I-6 (avant → après → source [lu] avec page/ligne)

Correspondance DÉCLARÉE entre les six libellés de la mission et les items du `RENDU.md` v1 : (1) pagination = I-1 ; (2) attribution GTM
= I-2 ; (3) « independent » = constat (4) de CHANTIERS l.941 (le I-3 du v1 est la demande de procurement des lettres du dossier, traitée
en §9) ; (4) `under_calib` = I-6 ; (5) Q3 / -b1-bis-ii = I-4 ; (6) agrégat mensuel Q6 = I-5.

| # | Avant (squelette ou dépôt) | Après (v2) | Source [lu] (page/ligne) |
|---|---|---|---|
| I-1 pagination | Lettre : DÉJÀ conforme (« pp. 57-58, ll. 2039-2048 », « p. 58 », « p. 57 ») ; l'erreur vit dans ADR-B0 l.133 « p.56-58 », GTM-BELL l.113 « p.56-59 », R-gtm l.27 et l.103 « p.56-59 » (relus ce tour) | Pages conservées ; les « ll. » (numéros de ligne d'une extraction interne) remplacés par section + page (« Section VI, Question 3, pp. 57-58 » ; C-13 appliqué, F-1) ; les quatre documents du dépôt restent à corriger par l'orchestrateur (I-v2-10) | Ordre, texte pré-extrait sha `adee69f6…4d08d` = `pdftotext -layout` du PDF `67bfb89a…0b18` (recalculé ce tour) : l.2026 « VI. Solicitation of Comments » en page 57 (carte par sauts de page, 60 `\f`) ; pieds de page l.2046 « 57 », l.2070 « 58 », l.2095 « 59 » ; l.2100 en page 60 |
| I-2 attribution GTM | Lettre : DÉJÀ conforme (clause « state so in the Notice » attribuée à l'item x) ; l'erreur vit dans GTM-BELL l.18 et l.60 (clause prêtée à l'item i ; relus ce tour) | La clause « state so » n'est plus citée (coupe de longueur) ; item i cité seulement pour « the steps (e.g., audits, certifications, attestations) » ; item x cité pour « third-party audits » et « public auditability of the distributed ledger » ; correction de GTM = orchestrateur (I-v2-10) | Item i p.39 l.1456-1458 (aucune clause « if none, state so ») ; item x p.44 l.1600-1611, dont l.1604-1606 (types d'audits, « public auditability of the distributed ledger ») et l.1609-1610 (« If the TSV does not have such procedures, state so in the Notice ») |
| I-3 « independent » | §1 du squelette : « The word "independent" does not appear in the Order. » (argument par ABSENCE, acte investisseur AI-11 ouvert) | Phrase RETIRÉE. Le vide est dit par ce que la Commission a ÉCRIT (décision 138 « vide exprimé ») : chaque TSV calcule et publie ses propres chiffres (II.F, II.G), la Commission reconnaît le risque d'erreur de calcul (p.26), le risque de dislocation (p.28), l'intention de suivre de près (p.57), la transparence des AMM (p.12), le registre public sans permission (p.18), l'auditabilité publique du registre (p.44). « Independent/independence » n'apparaît plus que comme revendication de Bell (§3 « Independent of the venues »), jamais prêté à la Commission ni à la lettre Ross | `grep -i -c independen` sur le texte de l'ordre = 0 ; 0 occurrence de `indep*` sur le texte mis à plat sans tirets (rejoué ce tour) ; lettre Ross : FAITS-lettre-ross l.19 (« independent » absent, [lu-orch]) ; passages cités ou paraphrasés p.12 l.464-465, p.18 l.694-695, p.26 l.1011-1013, p.28 l.1073-1077, p.44 l.1605-1606, p.57 l.2028-2030 |
| I-4 `under_calib` = T-3 | `[OPTION - keep only if served at filing: Statistical cells with too few observations are reported as under_calib.]` | RETIRÉ de la v2 (pas de crochet résiduel) ; réinsertion possible seulement si T-3 est servi et testé au dépôt (AI-6 (i), I-v2-7) | ADR-B0 D3 l.37 (classe `tsv-offhours-gap-24h` = T-3) ; enum fermé `apps/bell/src/residuals.ts` l.15-42 sans `under_calib` ; `grep -rn under_calib apps/bell/src` = 0 (rejoué ce tour) |
| I-5 Q3 = -b1-bis-ii | placeholders `<BELL:t4_…>` (source « MESURE-FONDATRICE ») sans lot ni commande | Six `<<MESURE: t4_TSLAx_…>>` nommant la source `docs/MESURE-FONDATRICE-bell-2026-09.md` produite par `node apps/bell/scripts/bell-report.mjs --founding --d9 <D9 -b1-bis-ii>`, l'agrégat exact (exceed1/2/5 sur withGt), l'unité (part des sessions) et le format ; constat V-8 : la colonne « > 2 » exige une extension (I-v2-3) | ADR-T1aii l.71 (chaîne collecteur → bell-report → MESURE-FONDATRICE), l.101 (sortie -b1-bis), l.362 (item #11 `--founding`) ; `bell-report.mjs` l.52-70 (n'agrège que exceed1/exceed5) ; `collect.ts` l.178/185 et `digest.ts` l.71 (exceed2 présent dans le digest) |
| I-6 agrégat mensuel Q6 | `[COND I-5 - keep only once the monthly aggregate is defined, pinned and tested: …]` avec des placeholders `<BELL:volm_…>` (source « bell-report F-aggregate », inexistante) | Crochet remplacé par cinq `<<MESURE: window_q6 / volm_…>>` qui PORTENT la condition (« si I-5 n'est pas livré au dépôt : retirer toute la phrase ») ; source corrigée : `vol_ratio` de `state.json` (course -b1-bis-ii ou T-1b) + agrégat I-5, **NON dérivable des artefacts go-1** (V-7, D-v2-2) | `apps/bell/src/volume.ts` l.1-10 et l.34-48 (ratio par session, ratio seul publié) ; ordre p.24 l.898-906 (limites 0.25/2.5 percent ; arithmétique : numérateur = volume journalier moyen du token sur le TSV, dénominateur = ADV du titre, mois précédent pour le dénominateur ; période du numérateur non précisée) |

## 3. Constats vérifiés de première main (chacun rejouable, §11)
- **V-1 — N_exact / pages / verdict des trois mints terminés** (fichiers des répertoires de complétion ; sha256 = ceux des manifestes
  `mint_end`) : TSLAx `n_exact 8783173`, `pages 8784`, `comparator_verdict.verdict "equal"`, `scan_complete true`
  (`crosscheck-TSLAx.json` sha `c4bccfd83582ac94a10b8add876b5ae58cf5d4fa2878da66c1922a4da3c258a7`) ; AAPLx `2628814` / `2629` / `equal` /
  `true` (`152de642269d05239a97c8d786d65681d9b9fea4fdb03249556082f09a01c02d`) ; NVDAx `8828036` / `8829` / `equal` / `true`
  (`45ca7fe5f4115891c280abad117c18ec646d885c9b9d35925f001e65bd401a57`). Rapports : `operators ["helius","solana-foundation"]`,
  `handoffs 0`. Concordant avec CHANTIERS l.838 (TSLAx), l.898 (AAPLx), l.964 (NVDAx). **SPYx : tirage en cours, NON lu** (RUNBOOK §2).
- **V-2 — chaîne re-dérivée indépendamment** (`scratchpad/v2/verify-ledgers.mjs`, sha `38c6b6b5…de23d2e`, formule ré-implémentée depuis
  la docstring `rebase-crosscheck.ts` l.126-131 et `verifyLedgerChain` l.187-203 à `a703e24`, PAS importée) : 3/3 chaînes intactes depuis
  la genèse (64 × « 0 »), numéros de page 1..n, 0 écart de `payload_sha256` re-dérivé ; tête = `ledger_sha256` du crosscheck (TSLAx
  `a0af1f207edd…10aa`, AAPLx `160637c5c761…f23b`, NVDAx `5fdac4617276…9274`) = colonne `entry_sha256` d'ANCHORS l.39, l.50, l.52 ;
  somme des `tx_count` = `n_exact` ; nombre d'enregistrements = `pages`. Pages à `tx_count` ≠ 1000 : TSLAx 5 (4 bornes de reprise où
  `tx + queue de la page précédente = 1000`, + page finale 180 tx), AAPLx 4 (3 + finale 828), NVDAx 2 (1 + finale 37) ; aucune page non
  finale inexpliquée (contrôle de cohérence ; la longueur BRUTE n'est pas stockée dans le ledger).
- **V-3 — manifestes** : sha256 recalculés = colonne `manifest_sha256` d'ANCHORS pour `probe_end` (`ea83d546…`), `mint_start-TSLAx`
  (`58b83d36…`), `mint_end-TSLAx` (`a682b3b7…`), `mint_end-AAPLx` (`8ba5f9c1…`), `mint_end-NVDAx` (`e2b8464b…`), `mint_start-SPYx`
  (`b9d4628e…`), `mint_resume-SPYx-1` (`0aaf72f6…`) ; chaque ligne des trois manifestes `mint_end` = sha du fichier correspondant du
  répertoire de complétion (ledger, crosscheck ; pour TSLAx aussi `budget.json` `88639158…` et `crosscheck-report.json` `9c3a3175…`).
- **V-4 — OTS : 15/15 preuves committées sont PENDANTES** : tag d'attestation pendante `83dfe30d2ef90c8e` présent, tag d'attestation de
  bloc Bitcoin `0588960d73d71901` absent (`xxd -p` sur `docs/course-bell/*.ots`) ; `git log -- docs/course-bell/*.ots` : 15 commits
  (`c05e37c` … `2b28efe`), tous « pending OTS proof », aucun commit d'upgrade. Client `ots` absent du PATH du worker (non installé ici ;
  le client épinglé est dans `F:\MONARK SUITE\ots\venv`, FAITS-opentimestamps l.26-27, non exécuté par le worker).
- **V-5 — quorum : l'énumération page à page est MONO-opérateur** (code à `a703e24`, `rebase-crosscheck.ts` sha `6a2b96ef…a98c`) :
  l.252 « gTfA is Helius-exclusive » ; l.275 chaque page = `getTransactionsForAddress` sur `heliusOp` ; SEULS les événements 43/x trouvés
  sont relus sur le 2ᵉ opérateur (l.301-305 : `getTransaction` sur `otherOp`, clé `bodyEventKey`, écart ⇒ page non committée,
  `body_quorum`) ; départ refusé sans deux opérateurs distincts configurés (l.250-251, `firstTwoDistinctOps` ⇒ `no_quorum`).
- **V-6 — « Solana Foundation »** : attribution = libellé du dépôt (`operators.ts` l.18 `"solana.com": "solana-foundation"`, commentaire
  « api.mainnet-beta.solana.com (Solana Foundation public RPC) ») ; aucune source primaire [lu] en dépôt (grep « Solana Foundation »
  dans `docs/` : 3 mentions sans rapport). La lettre décrit l'endpoint (« Solana's public mainnet endpoint ») ; PR-v2-1 formée (§9).
- **V-7 — Q6 : les artefacts go-1 ne portent AUCUN volume de pool** : enregistrement de ledger = cœur à 10 champs + `page_events` /
  `page_handoffs` (constaté sur les 3 ledgers, ex. première ligne de `ledger-TSLAx.jsonl`) ; seuls les corps candidats 43/x sont
  conservés (`candidates/` : TSLAx 1, AAPLx 6, NVDAx 6 fichiers) ; docstring `rebase-crosscheck.ts` l.225-227 (« the To-scale full
  page corpus is discarded after decode »).
- **V-8 — colonne « > 2 »** : le digest porte `exceed1/exceed2/exceed5` (`collect.ts` l.178/185 ; `digest.ts` l.71) mais
  `bell-report.mjs` (sha `e245f9d0…45c3`) n'agrège que `exceed1` et `exceed5` (`aggregate`, l.52-70 ; en-tête du tableau rendu l.90).
- **V-9 — ordre 34-106402** : cf. I-1 ; 15 citations localisées mot pour mot avec page concordante (§8, C-2).
- **V-10 — Cong et al., Table 4** : page imprimée 32 (= page PDF 33) ; Tesla xStock 71 % / 15 % (seuil 1), 57 % / 8 % (seuil 2),
  12 % / 0 % (seuil 5), « share of observed hours », close de Yahoo Finance ; lu sur le texte (`ssrn-5937314-tokenized-stocks.txt`
  sha `c4a2c899…d9fd`, l.1318-1336) ET sur le rendu-image de la seule page 32 (`scratchpad/cong-p33-33.png`, sha `1032a8df…3f46`, tiré
  du PDF `bb8b64b5…8d60`) [lu+img]. Auteurs, titre, date : l.1-6 du texte.
- **V-11 — « from its initialization »** : dans les trois ledgers, la première transaction de la page 1 est la transaction
  d'initialisation (`first_sig` = signature de l'événement `initialize` ; `slot_lo` = slot de l'initialize : TSLAx 346066196, AAPLx
  345862945, NVDAx 346066021).
- **V-12 — procédure 135(a) : la DERNIÈRE page des trois mints a été committée sous `--allow-short-pages`** : `budget.json` des trois
  répertoires de complétion = `"require_full_pages":false` (lu ce tour ; celui de TSLAx, sha `88639158…4960`, figure dans le manifeste
  `mint_end-TSLAx`). Faits de dépôt : tirage strict (`require_full_pages:true`) arrêté `not_full_pages` sur la page finale courte portant
  un `paginationToken`, puis complétion dans une COPIE du répertoire, 3 appels : page courte committée, page suivante vide ⇒ `exhausted`,
  ancre de fin C-8 OK, `complete:true` (CHANTIERS l.838 TSLAx, l.898 AAPLx, l.964 NVDAx ; ADR-T1aii D1-nonies §3 l.432-435). Toutes
  les pages non finales ont donc été committées sous la règle stricte (le code refuse une page courte non finale, `rebase-crosscheck.ts`
  l.311-317) ; V-2 le corrobore a posteriori. La règle BELL-SHORTPAGE-1 (sonde + ancre avant commit) est fusionnée (`f5fc682`, G7
  `31a2b89`) mais NON déployée sur l'arbre d'exécution (`a703e24`, époque « pre-shortpage », ANCHORS l.51 ; D1-nonies §7 (i)
  l.498-504) ⇒ la lettre ne décrit PAS la sonde ; elle décrit la règle stricte et, en toutes lettres, l'acceptation de la dernière page
  courte après une requête suivante vide et l'ancre de fin (F-11).

## 4. Faits Bell intégrés dans la v2 (mission §3) — chaque chiffre avec sa source de dépôt
| Fait (lettre §3) | Valeur | Source (fichier, champ / ligne) | Niveau |
|---|---|---|---|
| Quatre mints xStocks | TSLAx, AAPLx, NVDAx, SPYx | ANCHORS l.31 (énum `mint`), l.38-54 ; `crosscheck-report.json` `per_mint` | [lu] |
| Énumération complète du mint, depuis l'initialisation jusqu'à un slot épinglé, pages ≤ 1 000 tx | `GTFA_PAGE_LIMIT = 1000` ; `oracle_slot` 448651418 / 448651429 / 448651426 | `rebase-crosscheck.ts` l.64, l.273-275 ; crosscheck `oracle_slot` ; V-11 | [lu] |
| TSLAx | 8,783,173 tx / 8,784 pages | `crosscheck-TSLAx.json` `n_exact`, `pages` (sha `c4bccfd8…`) ; V-2 ; CHANTIERS l.838 | [lu] + recalcul |
| AAPLx | 2,628,814 / 2,629 | `crosscheck-AAPLx.json` (sha `152de642…`) ; V-2 ; CHANTIERS l.898 | [lu] + recalcul |
| NVDAx | 8,828,036 / 8,829 | `crosscheck-NVDAx.json` (sha `45ca7fe5…`) ; V-2 ; CHANTIERS l.964 | [lu] + recalcul |
| SPYx | en cours ⇒ `<<MESURE: nexact_SPYx>>` | à `mint_end-SPYx` | — |
| Log chaîné par SHA-256 (chaque entrée engage la précédente et le contenu décodé de la page) | 3/3 chaînes re-dérivées | `rebase-crosscheck.ts` l.126-131, l.147-160, l.187-203 ; ADR-T1aii D1-octies l.390-393 ; V-2 | [lu] + recalcul |
| Deux opérateurs distincts requis ; pages chez un seul (Helius) ; événements du multiplicateur relus sur l'endpoint public Solana ; écart ⇒ arrêt | — | V-5 ; ADR-T1aii l.8, l.236 (gTfA Helius-exclusif, pas d'équivalent) ; FAITS-floor-helius-n3 l.13 (méthode facturée sur le compte Helius du projet) | [lu] |
| Seconde méthode (scan de l'autorité du multiplicateur), même historique événement par événement : `equal` × 3 | TSLAx, AAPLx, NVDAx `equal`, `fieldDiffs []` ; SPYx ⇒ `<<MESURE: verdict_SPYx>>` | crosscheck `comparator_verdict` ; ADR-T1aii l.219-234 (méthode hybride, décision 60) ; `rebase-crosscheck.ts` l.1-5 | [lu] |
| Pages pleines sauf la dernière ; page fautée non enregistrée, arrêt, reprise depuis la dernière page enregistrée ; complétude = énumération épuisée + ancre de fin ; dernière page courte des trois mints acceptée après une requête suivante vide | — | `rebase-crosscheck.ts` l.280-345 ; ADR-T1aii D1-nonies §2 l.424-427, §3 l.432-435 ; CHANTIERS l.838, l.898, l.964 ; V-2, V-12 | [lu] |
| Budget d'appels fixé au lancement ; `budget_exhausted` ; appels comptés par méthode | ex. TSLAx `calls_used 8861`, `max_calls 25467` (non repris dans la lettre) | `rebase-crosscheck.ts` l.326-329, l.635, l.706-707 ; `crosscheck-*.json` `calls_by_method` | [lu] |
| Ancres à chaque frontière (`mint_start` / `mint_resume` / `mint_end`), manifeste des sha256, soumis à OpenTimestamps ; rattachement Bitcoin après upgrade | 15 frontières committées, 15 preuves pendantes ⇒ `<<MESURE: ots_upgraded>>` | ANCHORS l.15-31, l.38-54, l.61-66 ; FAITS-opentimestamps l.18, l.28, l.30 ; V-3, V-4 | [lu] |
| Limite de l'ancre | antériorité de la tête, ni provenance des pages ni exécution du scan | ANCHORS l.12-13, l.74 | [lu] |

**Non intégré, volontairement** : crédits Helius, nombres d'appels, slots épinglés, dates des frontières (valeurs internes sans utilité
pour la Commission ; les crédits relèvent de FAITS-floor-helius-n3, lecture de tableau de bord) ; chiffre SPYx (tirage en cours).

## 5. Autres changements squelette → v2 (F-n, chacun motivé)
- **F-1 C-13 appliqué** : « ll. » → « Section X, p. N » (table §D de SOURCES re-vérifiée contre les en-têtes de l'ordre : I l.10 p.1,
  I.B l.421 p.11, II l.660 p.17, II.A l.693 p.18, II.E l.859 p.22, II.F l.885 p.23, II.G l.1084 p.28, II.L l.1286 p.33, III l.1364 p.36,
  VI l.2026 p.57) ; pages prouvées par le harnais (§8, C-2). Les lignes restent en §8.
- **F-2 Conditions H et J retirées** de §1 (non nécessaires à Q3/Q6 ; mission v1 seulement) ; **O-15 (p.19, code des contrats) retiré**
  (remplacé par l'item x « public auditability of the distributed ledger », plus proche du propos).
- **F-3 Ajouts §1** (tous du texte primaire) : « inadvertently … for example "due to a miscalculation…" » (p.26 l.1011-1013) ;
  « notes the risk … designs the volume limits » (p.28 l.1071-1077) ; II.A registre public sans permission (p.18 l.694-697) ; item x
  (p.44 l.1603-1606).
- **F-4 Tableau Q3 restructuré** en 6 lignes (régime × seuil), un placeholder par ligne (compte `grep -c` exact) ; pipes internes
  échappés `\|` (tableau GFM valide : 8 lignes × 5 pipes non échappés).
- **F-5 Référence Cong** : id SSRN retiré (absent du texte du papier) ; citation complète sans lui : auteurs, titre, « December 2025 »,
  Table 4, p. 32 (V-10) ⇒ plus de `<REF:…>`.
- **F-6 §3 réécrit autour des faits go-1** (§4) : puces « First-hand data, logged as collected », « Two data operators » (exacte, V-5),
  « Complete pages, fail-closed », « Declared budget », « Anchored » (pendant ⇒ placeholder) ; puces « Recomputable », « Signed »,
  « Independent of the venues », « Declared abstention » reprises du squelette (placeholders convertis).
- **F-7 Mention NEAR × Ondo** (décision 139) : une phrase « future version », sans chiffre de marché, en §4 (limites de population) —
  FAITS-near-ondo l.7 (page datée « September 22, 2026 », « near.com × Ondo »), l.9 (symboles TSLA/AAPL/NVDA/SPY) ; la réserve « where
  the quantities involved are public and recomputable » suit l.16-18 (exécution confidentielle) et l.33-36 (item BELL-NEAR-1).
- **F-8 Options retirées** : `under_calib` (I-4) et « We intend to apply the same method to TSV pools » (AI-6 (ii), engagement
  prospectif non décidé ; la phrase « The method transfers to TSV pools; the population does not. » reste en §2).
- **F-9 Coupes de longueur** (mesure : 4 pages à 1,15 après la première écriture, le seul bloc de signature débordant) : paragraphe « A
  third-party record complements … » (C-14 coupe n°1 ; le résumé porte l'idée) ; phrase du résidu nommé `authority_scan_mono_operator`
  (le caractère mono-opérateur reste dit en toutes lettres) ; « only recomputation bears on the fact » ; « committed to our repository » ;
  compressions (légende Q3, limite §4, phrase NEAR, titre §3).
- **F-10 Relecture adversariale propre (auto-R-21), 8 corrections** : (1) résumé : « figures … produced by each venue about itself »
  était faux pour le dénominateur (ADV = plan de reporting, p.24 l.899, l.905-906) ⇒ « each venue computes its own volume against the
  limits and publishes its own transaction data » ; (2) II.E : paraphrase alignée sur l.870-872 (« provides holders the same rights and
  privileges ») ; (3) II.L : « must consent to staff examinations » (l.1336) ; (4) p.26 : « inadvertently … for example » restitués ;
  (5) p.28 : « anticipates » → « notes the risk », « sets » → « designs » (l.1071, l.1076) ; (6) « from the public ledger » retiré de « Both
  concern quantities that Bell measures » (le gap et le ratio utilisent aussi un close et un ADV sous licence) ; (7) Q6 : « current »
  retiré (la fenêtre peut être 2025) ; (8) limite §4 : « the second operator … reduce this risk » était faux (le 2ᵉ opérateur ne relit
  que les événements trouvés, V-5) ⇒ « for the multiplier history, the second method reduces this risk ». Plus : « a vendor's derived
  feed » → « raw transactions … not a derived data feed » (Helius est lui-même un fournisseur).
- **F-11 Transparence de la procédure 135(a)** (revue finale, V-12) : puce « Complete pages, fail-closed » complétée par « for the three
  completed mints, the short last page was accepted this way, after the next request returned nothing » ; la règle stricte reste
  énoncée (elle a gouverné toutes les pages non finales) ; la sonde BELL-SHORTPAGE-1, non déployée, n'est pas décrite.
- **F-12 Compression** de la seconde phrase de la mise en garde Q3 (« It measures no effect … and implies no causal link. »), sens
  inchangé, pour garder 3 pages après F-11.
- **F-13 Format Q3** : le rapport `bell-report.mjs` rend les parts à 2 décimales (`pct`, l.72) ; le placeholder `t4_TSLAx_wkn_gt1`
  (et, par « même unité et format » / « idem », les cinq autres) exige un entier arrondi depuis cette valeur, arrondi déclaré au
  remplissage.

## 6. D-n — décisions et écarts du worker (motivés, vérifiables)
- **D-v2-1 (prémisse de mission corrigée — `error_origin` : plan/orchestrateur)** : « collectés page par page sous quorum-2 d'opérateurs
  indépendants (Helius + Solana Foundation) » est inexact tel quel (V-5). La lettre dit : deux opérateurs distincts requis ; pages chez
  Helius seul ; événements du multiplicateur relus sur l'endpoint public Solana ; écart ⇒ arrêt. Le mot « independent » n'est pas
  employé pour les opérateurs (« distinct »).
- **D-v2-2 (prémisse corrigée — `error_origin` : orchestrateur, CHANTIERS l.941 « volumes par pool du tirage go-1 pour Q6 »)** : V-7.
  Source Q6 attendue = `vol_ratio` de `state.json` (course -b1-bis-ii ou T-1b) + agrégat I-5 ; dit dans le placeholder `window_q6`.
- **D-v2-3 (prémisse corrigée)** : « ancres … horodatées » : soumises, mais 15/15 pendantes (V-4) ; la lettre décrit la procédure et
  porte `<<MESURE: ots_upgraded>>` ; jamais « tied to a Bitcoin block » au présent.
- **D-v2-4 (cadrage des N_exact, avis advisor)** : les 8,78 M de transactions TSLAx sont TOUTES les transactions du mint, énumérées pour
  établir l'historique du multiplicateur, pas des transactions de négociation des pools ; la lettre le dit (« Stating prices per
  underlying share requires each token's on-chain multiplier over time; to establish it, … »).
- **D-v2-5 (noms d'opérateurs)** : Helius nommé (opérateur réel de l'énumération : code l.252/l.275 ; FAITS-floor-helius-n3, lecture du
  tableau de bord du projet « bell-course-2026-09 ») ; second opérateur décrit par son endpoint, « Solana Foundation » non écrit faute de
  source primaire (V-6, PR-v2-1). Décision 69 (CHANTIERS l.223) ne vise que le fournisseur de recoupement CASH : non concernée ; aucun
  fournisseur de close ni d'ADV n'est nommé.
- **D-v2-6 (AI-11)** : phrase « independent » retirée (I-3) — proposition réversible par l'investisseur (I-v2-5).
- **D-v2-7 (grammaire des placeholders)** : `<<DATE>>` et `<<SIGNATAIRE>>` tels que dictés ; mesures `<<MESURE: nom | unité/format |
  source attendue : …>>` ; surfaces servies `<<SERVI: nom | attendu | preuve attendue : …>>` ; actes `<<INVESTISSEUR: nom | … | source
  attendue : acte AI-n>>`. Aucun « > » ni « << » à l'intérieur d'un placeholder (analyse `<<[^>]*>>` exacte).
- **D-v2-8 (gate)** : la commande du dépôt applique les motifs GLOBAL au fichier cible (`grep-forbidden.mjs` l.250-256) et rescane tout
  le dépôt ⇒ 0 hit, exit 0. Le harnais tous-scopes (§8, C-4) trouve 8 hits du seul scope `harness` (règle « numeric percentage ») :
  seuils 1/2/5 de Cong (l.28, l.32-37) et limites 0.25/2.5 de l'ordre (l.60) — des parts d'heures publiées et des limites
  réglementaires, pas des « % de confiance » ; la règle vise la surface harness (« never a rate of being right »). Décision de scope =
  orchestrateur (I-v2-9, reprise de I-10) ; aucun contournement (les nombres ne sont pas écrits en lettres pour esquiver le motif).
- **D-v2-9 (lecture dans le `--out` vivant — déviation déclarée)** : pendant l'orientation, un `cat` de
  `F:\course-bell\bell-b3d-run\crosscheck-SPYx.json` (artefact de sonde du 2026-09-22 15:05, non réécrit pendant le tirage) et des
  `ls`. Le tirage SPYx tourne sous l'arbre `a703e24`, époque pré-C-6 (`writeFileSync`, tolère les lecteurs : ADR-T1aii D1-nonies §6
  l.477 ; ANCHORS l.51) ; aucun autre accès ; rien d'écrit. Le RUNBOOK §2 vise les tirages sous C-6 ; déclaré quand même.
- **D-v2-10 (outillage)** : heredoc Bash long en échec ⇒ outil Write ; le transport Bash réduit une double barre oblique inverse
  (CONSIGNE A-13) ⇒ scripts à expressions régulières écrits par l'outil Write.
- **D-v2-11 (procédure 135(a), `error_origin` : worker — omission attrapée par la revue finale)** : la première version de la puce
  « Complete pages » énonçait la règle sans dire que la dernière page des trois mints avait été committée en mode `--allow-short-pages`
  (artefact ancré `require_full_pages:false`). Corrigé par F-11 ; preuve V-12. La phrase « Every page but the last must be full » est
  conservée comme RÈGLE (vraie pour toutes les pages non finales, code l.311-317 + CHANTIERS l.838/898/964) plutôt que réécrite en fait
  (« is full ») : la longueur brute des pages n'est pas stockée dans le ledger, le fait n'est corroboré qu'en cohérence (V-2).

## 7. Placeholders restants — 26 (`grep -c '<<'` = 26 lignes = 26 occurrences)
| # | Placeholder (ligne) | Type | Unité / format | Source attendue | Déclencheur |
|---|---|---|---|---|---|
| 1 | `<<DATE>>` (l.3) | acte | « Month D, YYYY » | acte investisseur AI-1/AI-4 | go de dépôt |
| 2-7 | `t4_TSLAx_{wkn,we}_{gt1,gt2,gt5}` (l.32-37) | MESURE | part des sessions avec g calculé dépassant le seuil ; entier + signe pour cent, arrondi depuis la valeur à 2 décimales du rapport (arrondi déclaré, F-13) | `docs/MESURE-FONDATRICE-bell-2026-09.md` via `node apps/bell/scripts/bell-report.mjs --founding --d9 <D9 -b1-bis-ii>` | course -b1-bis-ii terminée et ancrée ; item #11 livré ; pour gt2 : I-v2-3 |
| 8 | `window_TSLAx` (l.40) | MESURE | dates UTC, « July 1 to October 31, 2025 » ou bornes par pool | provenance de course -b1-bis-ii + MESURE-FONDATRICE | idem |
| 9-10 | `n_TSLAx_wkn`, `n_TSLAx_we` (l.42, l.44) | MESURE | entier (sessions avec g) | MESURE-FONDATRICE, colonne « n with g_t » | idem |
| 11 | `url_report` (l.46) | SERVI | URL | `curl -sI` ⇒ 200 + test d'intégration du chemin servi | T-1b servi |
| 12 | `window_q6` (l.51) | MESURE | mois civils | agrégat I-5 sur `vol_ratio` (state.json -b1-bis-ii ou T-1b) ; pas go-1 | I-5 livré, sinon retrait de la phrase |
| 13-16 | `volm_{TSLAx,AAPLx,NVDAx,SPYx}` (l.53-59) | MESURE | décimal à 3 décimales + mot « percent » | sortie de l'agrégat I-5 | idem |
| 17 | `nexact_SPYx` (l.67) | MESURE | « N,NNN,NNN in N,NNN » | `crosscheck-SPYx.json` listé au manifeste `mint_end-SPYx` | `mint_end-SPYx` ancré ; si incomplet ou ≠ equal : réécrire |
| 18 | `verdict_SPYx` (l.70) | MESURE | « equal » ou verdict + raison | `comparator_verdict` du même fichier | idem |
| 19 | `ots_upgraded` (l.74) | MESURE | « N of M proofs upgraded as of Month D, YYYY » | `ots upgrade` + `ots verify` sur `docs/course-bell/*.ots` | I-v2-4 ; au plus tard avant dépôt (C-5) |
| 20 | `relation_commerciale` (l.79) | acte | phrase de l'investisseur | acte AI-5 | date du dépôt |
| 21 | `residual_counts` (l.82) | MESURE | « code: N », ou renvoi au champ `residuals` | `state.json` (test `bell_abstentions_counted`) | -b1-bis-ii ou T-1b |
| 22-23 | `url_state`, `url_timeline` (l.94-95) | SERVI | attendu `https://bell.monarkgate.tech/{state.json,timeline.jsonl}` (ADR-B0 D2 l.24) | `curl -sI` ⇒ 200 + test d'intégration | T-1b backend servi (DNS compris) |
| 24 | `url_method` (l.97) | SERVI | page `/bell/method` (hôte à confirmer) liant clé publique, ancres, code de rejeu | `curl -sI` + liens + validation visuelle investisseur (décision 73) | T-1b-site ; sinon retrait de « anyone can recompute » / « with the published replay code » |
| 25 | `contact` (l.99) | acte | adresse publique (non expurgée, p.60) | acte AI-9 | dépôt |
| 26 | `<<SIGNATAIRE>>` (l.103) | acte | nom, titre, organisation (champ « Commenter Name ») | acte AI-3 | dépôt |

Placeholders du squelette REMPLIS (ne dépendent pas de mesures futures) : `<BELL:crosscheck_verdicts>` (⇒ « TSLAx, AAPLx and NVDAx
(verdict equal) », + SPYx en placeholder) ; `<BELL:anchored_runs>` (⇒ procédure décrite + `ots_upgraded`) ; `<REF:cong_ssrn>` (⇒ retiré,
F-5). Phrases au présent qui exigent un chemin servi au jour du dépôt (règle Branchement, NOTE-DEPOT C-4) — état au 2026-09-23 :
| Phrase (v2) | Chemin servi requis | État 2026-09-23 |
|---|---|---|
| « keeps a public, signed record » (résumé) ; « Each line of the public timeline is signed » (§3) | timeline signée publiée + clé publique | non servi (T-1b) |
| « Bell publishes g = … » (Q3) ; « Bell publishes the ratio … » (Q6) ; « Abstentions are counted and published » | `state.json` publié | non servi (T-1b) |
| « can be recomputed … with the published replay code » | code de rejeu public lié depuis `url_method` | non exporté (CHANTIERS l.59) |
| faits go-1 (§3, première et deuxième puces) | aucun (faits passés, sourcés §4) | vrais aujourd'hui |

## 8. Contrôles (rejouables, §11)
- **C-1 gate du dépôt** : `node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v2.md` (depuis `F:\Monark`) ⇒ « gate:vocab OK —
  scanned 224 file(s), no forbidden claim. » au HEAD `38c767e`, puis « scanned 225 file(s) » au HEAD `ec68fdf` sur la lettre finale
  (le décompte suit l'arbre du dépôt), exit 0 ⇒ **0 hit**.
- **C-2 citations** (`scratchpad/v2/check-v2.mjs`, sha `0b266bc4…71de`) : 16 spans entre guillemets = 15 citations de l'ordre localisées
  mot pour mot, page citée = page réelle, ≤ 25 mots (max 17), + 1 non-citation attendue (« Tokenized Stocks », titre du papier).
  Lignes : p.14 l.570-572 ; p.57 l.2028 ; p.57 l.2029-2030 ; p.23 l.870 ; p.39 l.1456 ; p.17 l.672-673 ; p.35 l.1337 ; p.26 l.1012-1013 ;
  p.28 l.1074 ; p.28 l.1076-1077 ; p.12 l.464-465 ; p.44 l.1605-1606 ; p.57 l.2039-2040 ; p.57 l.2043 ; p.2 l.30.
- **C-3 structure** : 26 placeholders, un par ligne ; tableau GFM : 8 lignes, 5 pipes non échappés chacune ; **CR = 0 octet**
  (`tr -cd '\r' < LETTRE-4-927-v2.md | wc -c`) ; aucune clé, aucune URL privée, aucune IP, aucune adresse courriel, aucun UUID (grep §11) ;
  seules URLs : les deux adresses PUBLIQUES attendues de ADR-B0 D2 l.24, dans des placeholders.
- **C-4 harnais tous-scopes** (`scratchpad/v2/check-vocab-v2.mjs`, sha `ed1834f0…cfc`, réutilise `compilePatterns`/`scanText` exportés
  par le gate) : global/monark/site/skills/narabi_docs/sentinel/bell = 0 ; harness = 8 (D-v2-8). Liste publique C-12 : « first » ×2 =
  « first-hand » (pas une revendication de nouveauté) ; « only » ×6, tous restrictifs ; « probability » ×1 = « no probability »
  (forme niée exemptée) ; « attestations » ×1 = mot de la Commission (item i) ; « certif… » ×2 = citation + négation ; « independen… » ×2
  = revendication de Bell ; 0 : partner, autonomous, guarantee, verified, score, live, built, standard, interval, proven, confidence,
  accuracy, price band, ±, reference price, endorse, approve.
- **C-5 longueur mesurée** (`scratchpad/v2/render-v2.mjs`, sha `1da43129…aa1d` ; RTF → PDF par LibreOffice headless LOCAL, profil isolé
  du scratchpad ; valeurs représentatives à la place des placeholders) sur la lettre FINALE : **3 pages** en Times 11 pt, marges
  1 pouce, interligne 1,05 (page 3 = 428 mots) et 1,15 (page 3 = 530 mots, signature comprise, ≈ 12 % de page libre au rendu-image
  `v2p-3.png`) ; **4 pages en 12 pt** (330 mots en page 4). Les sha des PDF de mesure changent à chaque conversion (date de création
  embarquée) : dernier `v2-115.pdf` `3dc2c5c3…` ; ce ne sont pas des versions déposables. Calibration du moteur sur le squelette
  (`skel-to-v2grammar.mjs`) : 3 pages à 1,15 (409 mots en page 3), 4 en 12 pt (142 mots en page 4) — concordant avec la mesure v1
  (NOTE-DEPOT C-14). **Format retenu et mesuré : 11 pt.** Si le format final imposait 12 pt, les coupes pré-déclarables (clause II.A,
  « though it must consent … (II.L) », fusion de « Signed » dans « Recomputable », légende Cong réduite aux unités, phrase NEAR
  raccourcie) ne couvrent qu'environ 100 mots sur les ≈ 330 à retirer : **INSUFFISANT** — il faudrait retirer en plus une puce
  entière (candidat : « Declared budget », fusionnée en une demi-phrase dans « Complete pages ») et le paragraphe de mise en garde Q3,
  à re-mesurer ; décision d'orchestrateur/investisseur, non prise ici.
- **C-6 squelette intact** : sha256 `3f27e46b57fd32747aa58c245c468dd3ccfd2fd470d90ce8ba7fd187624c239c` avant et après.

## 9. Items formés (propriétaire + déclencheur ; zéro dû nu) et demandes de procurement
| # | Item | Propriétaire | Déclencheur |
|---|---|---|---|
| I-v2-1 | Corriger dans les textes orchestrateur la formule « collectés page par page sous quorum-2 » (D-v2-1) | orchestrateur | prochaine entrée CHANTIERS sur la lettre ; au plus tard G2 texte (C-11) |
| I-v2-2 | Source Q6 : l'agrégat I-5 s'appuie sur `vol_ratio` (fait iii du collecteur) de -b1-bis-ii ou T-1b, pas sur go-1 ; corriger CHANTIERS l.941 | orchestrateur → worker du lot porteur d'I-5 | G0 du lot porteur (-b1-bis-ii ou T-1b) ; avant tout remplissage de `volm_*` |
| I-v2-3 | Étendre `bell-report.mjs` (`aggregate` + rendu) à `exceed2` dans l'item #11 `--founding` ; test non-LLM + mutant (exceed2 ignoré ⇒ rouge) | orchestrateur → worker -b1-bis-ii | G0 -b1-bis-ii (item #11) |
| I-v2-4 | `ots upgrade` + `ots verify` des 15 preuves pendantes (et suivantes), commit des preuves mises à niveau (ANCHORS étape 3) | orchestrateur | avant remplissage de `ots_upgraded` ; au plus tard avant dépôt (NOTE-DEPOT C-5) |
| I-v2-5 | AI-11 tranché par proposition (phrase « independent » retirée) : l'investisseur confirme ou rétablit | investisseur | relecture conjointe avant dépôt |
| I-v2-6 | AI-7 reste ouvert (« operated and deployed by the MONARK orchestrator » conservé tel quel, formule ESC-2) | investisseur | idem |
| I-v2-7 | AI-6 : options retirées de la v2 ; `under_calib` réinsérable seulement si T-3 servi et testé ; phrase TSV prospective disponible telle quelle (squelette l.54) | investisseur | idem |
| I-v2-8 | Rejouer `check-v2.mjs` + `check-vocab-v2.mjs` + le gate du dépôt sur le texte REMPLI (placeholders et valeurs réelles) | orchestrateur (G2 texte C-11) | après remplissage |
| I-v2-9 | Décision de scope du gate pour une lettre publique (8 hits `harness` « pourcentage », D-v2-8 ; reprise de I-10) | orchestrateur | C-12 |
| I-v2-10 | Corriger ADR-B0 l.133, GTM-BELL l.113, R-gtm l.27/l.103 (pages 56-58/59 → 57-60) et GTM-BELL l.18/l.60 (clause « state so » ≠ item i) ; GTM l.64/113/125 et R-gtm l.91 (14 lettres au 22/09) — reprises de I-1, I-2, I-13 du v1 | orchestrateur | prochain commit touchant ces documents ; au plus tard G7 du lot lettre |
| I-v2-11 | Relire SUR PLACE les lettres du dossier à la date du dépôt (reprise de I-3/C-8 du v1 : Ross [lu-orch] par FAITS-lettre-ross ; les autres non lues ; la v2 ne cite aucune lettre du dossier) | orchestrateur (lecture sur place) | avant dépôt (C-8) |

**PR-v2-1 — demande de lecture sur place formée (identité de l'opérateur du second endpoint)** : quoi — l'opérateur de l'endpoint public
Solana utilisé comme second opérateur (domaine `solana.com`, id interne `solana-foundation`, `operators.ts` l.18 ; FICHE-GO-1 l.204-206) ;
source primaire attendue — page de documentation Solana des clusters / endpoints RPC publics, lue sur place par l'orchestrateur ;
tentatives — grep du dépôt (aucune source [lu]) ; worker sans réseau par mandat ; usage — écrire éventuellement « operated by the
Solana Foundation » dans la puce « Two data operators » (sinon la description d'endpoint reste, déjà exacte) ; non bloquant.
**PR (reprise I-8 du v1, désormais optionnelle)** : id SSRN de Cong et al. — plus requis par la lettre (F-5) ; utile seulement si
l'investisseur veut un lien.

## 10. Sources lues (sha256 recalculés ce tour ; niveaux)
| Fichier | sha256 | Portée | Niveau |
|---|---|---|---|
| `docs/sec-4927/LETTRE-4-927-squelette.md` | `3f27e46b…c239c` | intégral | [lu] |
| `docs/sec-4927/SOURCES.md` | `463f3738…040b` | intégral | [lu] (lignes héritées du v1 re-vérifiées quand reprises : §2, §8) |
| `docs/sec-4927/NOTE-DEPOT.md` | `c09ef74e…cfa0` | intégral | [lu] |
| `docs/sec-4927/RENDU.md` | `def695d3…3b53` | intégral | [lu] |
| `docs/sec-4927/FAITS-lettre-ross-4-927-2026-09-23.md` | `a6dee725…04de` | intégral | [lu] (contenu = [lu-orch]) |
| `docs/CHANTIERS.md` | `6a3bd693…965b` (HEAD `38c767e`) ; `d57ba7d3…41ec` (HEAD `ec68fdf`, +12 lignes après l.979) | ciblé : l.49, 55, 119-123, 212, 223, 313, 321, 329, 414, 592, 838, 898, 915, 921, 941, 964 | [lu] |
| `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` | `c54b7675…fe31` | intégral (606 l.) | [lu] |
| `docs/adr/ADR-B0-programme-bell.md` | `aaefd7f2…ac63` | l.21, 24, 28, 30, 37, 50, 60-61, 68-78, 128-135 | [lu] |
| `docs/course-bell/ANCHORS.md` | `d8d88928…f974a` | intégral | [lu] |
| `docs/course-bell/*-manifest.txt` + `*.ots` (15) | V-3 / V-4 | intégral / tags binaires | [lu] + recalcul |
| `docs/course-bell/FAITS-floor-helius-n3-2026-09-23.md` | `56413795…36a4` | intégral | [lu] (contenu = [lu-orch]) |
| `docs/course-bell/FAITS-near-ondo-2026-09-22.md` | `b8385dc8…13ad` | intégral | [lu] (contenu = [lu-orch]) |
| `docs/course-bell/FAITS-opentimestamps-2026-09-22.md` | `7f2bc871…d6f5` | intégral | [lu] (contenu = [lu-orch]) |
| `docs/course-bell/RUNBOOK-supervision-tirage.md` | `aa06b62a…b77a` | intégral | [lu] |
| `docs/course-bell/FICHE-GO-1.md` | `136acf73…1e80` | l.1-30 + grep « volume/pool » | [lu] partiel |
| `docs/GTM-BELL.md` ; `docs/biblio/bell/R-gtm-bell-sources.md` | `479c62de…3b41` ; `20979af2…3494` | l.18, 60, 113 ; l.27, 103 | [lu] |
| `vocab-banned.json` ; `scripts/grep-forbidden.mjs` | `f74f8e61…cdd5` ; `fe0566b8…baff` | intégral | [lu] |
| `apps/bell/scripts/bell-report.mjs` | `e245f9d0…45c3` | l.1-140 | [lu] |
| `apps/bell/src/{residuals,volume,gap}.ts` | `d7b43f53…8137` ; `d521dd87…6083` ; `9dd168af…0f914` | l.10-50 ; l.1-50 ; l.60-110 | [lu] |
| `apps/bell/src/collect.ts` ; `digest.ts` (HEAD `38c767e`) | `67d7091f…9fb1` ; `c1e48f39…1eac` | grep exceed (l.178, 185 ; l.71) | [lu] |
| `F:\Monark-wt-bellexec\apps\bell\src\rebase-crosscheck.ts` (`a703e24`) | `6a2b96ef…a98c` | l.1-64, 120-345 + grep | [lu] |
| `…\operators.ts` ; `…\rebase-scan.ts` (`a703e24`) | `8e76a6c9…a50e` ; `1d3c892a…c522` | intégral ; l.109-114 | [lu] |
| `F:\course-bell\bell-b3d-run-{tslax,aaplx,nvdax}-completion\{crosscheck-*.json, crosscheck-report.json, ledger-*.jsonl, budget.json}` | V-1, V-2, V-3 | intégral (JSON) ; ledgers re-dérivés en entier | [lu] + recalcul |
| Ordre 34-106402 (texte pré-extrait / PDF) | `adee69f6…4d08d` / `67bfb89a…0b18` | l.1-34, 458-468, 566-574, 668-676, 693-700, 868-873, 893-912, 1008-1016, 1068-1090, 1330-1340, 1364-1846 (items), 1450-1460, 1596-1612, 2018-2100 ; carte des en-têtes | [lu] |
| Cong et al. (texte / PDF / rendu page 32) | `c4a2c899…d9fd` / `bb8b64b5…8d60` / `1032a8df…3f46` | l.1-8, 1318-1338 ; image de la seule page 32 | [lu+img] |

Aucune source [2nd] nouvelle n'est introduite dans la lettre ; aucun chiffre de marché ; les faits d'autres documents cités par un
document lu ne sont pas repris comme faits.

## 11. Rejeu des vérifications (R-21) — commandes
- Chaînes et comptes : `cd F:/course-bell && node <scratchpad>/v2/verify-ledgers.mjs bell-b3d-run-tslax-completion/ledger-TSLAx.jsonl
  bell-b3d-run-tslax-completion/crosscheck-TSLAx.json bell-b3d-run-aaplx-completion/ledger-AAPLx.jsonl
  bell-b3d-run-aaplx-completion/crosscheck-AAPLx.json bell-b3d-run-nvdax-completion/ledger-NVDAx.jsonl
  bell-b3d-run-nvdax-completion/crosscheck-NVDAx.json` (NE PAS viser `bell-b3d-run\` tant que SPYx tourne).
- Manifestes : `cd F:/Monark/docs/course-bell && sha256sum *-manifest.txt` ⇒ colonne `manifest_sha256` d'ANCHORS ; `sha256sum` des
  fichiers des répertoires de complétion ⇒ lignes des manifestes `mint_end`.
- OTS : pour chaque `docs/course-bell/*.ots` : `xxd -p f | tr -d '\n' | grep -o 83dfe30d2ef90c8e | wc -l` (pendante) et
  `… grep -o 0588960d73d71901 | wc -l` (Bitcoin) ; `git log --oneline -- docs/course-bell/*.ots`.
- Quorum : `sed -n '247,345p' F:/Monark-wt-bellexec/apps/bell/src/rebase-crosscheck.ts` (l.250-253, 275, 301-305).
- Ordre : `pdftotext -layout sec-34-106402-innovation-exemption.pdf - | sha256sum` ; `grep -c $'\f'` = 60 ; `grep -i -c independen` = 0 ;
  carte : `awk 'BEGIN{p=1}{n=gsub(/\f/,"");p+=n;printf "%d\tp%d\t%s\n",NR,p,$0}' <txt>`.
- Lettre : `node <scratchpad>/v2/check-v2.mjs F:/Monark/docs/sec-4927/LETTRE-4-927-v2.md` ; `node <scratchpad>/v2/check-vocab-v2.mjs …` ;
  `cd F:/Monark && node scripts/grep-forbidden.mjs docs/sec-4927/LETTRE-4-927-v2.md` ; `grep -c '<<'` ; `grep -o '<<' | wc -l` ;
  `tr -cd '\r' < LETTRE-4-927-v2.md | wc -c` ; `node <scratchpad>/v2/wordcount.mjs <squelette> <v2>`.
- Longueur : `node <scratchpad>/v2/render-v2.mjs <v2> v2-115.rtf 22 252` (idem `22 231`, `24 276`) puis
  `soffice -env:UserInstallation=file:///<scratchpad>/lo-profile --headless --convert-to pdf …` et `pdfinfo`.
- `<scratchpad>` = `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad` (harnais : `v2/verify-ledgers.mjs`
  `38c6b6b5…`, `v2/check-v2.mjs` `0b266bc4…`, `v2/check-vocab-v2.mjs` `ed1834f0…`, `v2/wordcount.mjs` `82ace497…`, `v2/render-v2.mjs`
  `1da43129…`, `v2/order-paged.txt` carte ligne→page).

Aucun commit (R-20), aucun workflow, aucun appel réseau ; écritures : deux fichiers sous `docs/sec-4927/` + scratchpad de session.
