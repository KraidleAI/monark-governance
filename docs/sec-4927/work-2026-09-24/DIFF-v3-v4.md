# DIFF v3 -> v4 — lettre SEC 4-927

**Provenance** : worker `claude-opus-5-5[1m]`, 2026-09-24 ; `diff -u LETTRE-4-927-v3.md LETTRE-4-927-v4.md` lancé depuis
`F:\Monark\docs\sec-4927\`. v3 sha256 `47bf075ee2bd0ee7b5c1c7acdca8fd17d2a3b6e4c9321bc80dd86b20ef1e7a17` (inchangée) ; v4 sha256 :
RENDU-v4.md §9. La v4 est produite par `apply-v4.mjs` (scratchpad de session, sha au RENDU-v4.md §9) : 22 substitutions exactes
(identifiants E01 à E20, E06 et E08 en deux parties), chacune exige une occurrence unique du texte v3 ; toute ligne non visée est
identique à l'octet. Hunks : l.1, 3, 15, 27, 29, 33, 48, 56, 61-64, 78-82, 84, 88 ; 88 lignes avant et après.

````diff
--- LETTRE-4-927-v3.md	2026-09-23 08:33:38.741207100 +0100
+++ LETTRE-4-927-v4.md	2026-09-24 15:46:41.248861300 +0100
@@ -1,6 +1,6 @@
-[INTERNAL DRAFT v3 - NOT FOR FILING. Every double-angle placeholder is filled from an anchored artifact, a served URL or an investor act before filing; each one names its source and trigger (full list: RENDU-v3.md). Remove this line before filing.]
+[INTERNAL DRAFT v4 - NOT FOR FILING. Every remaining double-angle placeholder is filled from an anchored artifact or an investor act before filing; each one names its source, and RENDU-v4.md lists its trigger and who provides it. Remove this line before filing.]
 
-<<DATE>>
+<<DATE | date du dépôt, format « Month D, YYYY » | source : acte investisseur AI-4 (go de dépôt, NOTE-DEPOT §3)>>
 
 Via the Commission's internet comment form
 Vanessa A. Countryman, Secretary
@@ -12,7 +12,7 @@
 
 Dear Ms. Countryman:
 
-**Summary.** MONARK Bell keeps a public, signed record of how tokens that track U.S. equities trade on public ledgers, in particular while U.S. markets are closed, designed so that anyone can recompute it. On Questions 3 and 6, we report what Bell measures and suggest four properties that the Commission could expect from a TSV's publication under Section II.G, so that a third party could recompute what a venue reports; Bell applies them to its own records.
+**Summary.** MONARK Bell keeps a public, signed record of how tokens that track U.S. equities trade on public ledgers, in particular while U.S. markets are closed, and publishes its method. On Questions 3 and 6, we report what Bell measures and suggest four properties that the Commission could expect from a TSV's publication under Section II.G, so that a third party could recompute what a venue reports; Bell applies them to its own records.
 
 ## 1. What the Order asks, and what it relies on
 
@@ -24,13 +24,13 @@
 
 ## 2. What Bell measures on Questions 3 and 6
 
-*Population.* Bell's data come from four tokens, TSLAx, AAPLx, NVDAx and SPYx, traded on public AMM pools on Solana, not on a TSV. We make no representation that they are Tokenized NMS Stock: the Order excludes an asset that "provides synthetic exposure to an underlying security" (Section I, p. 2). The method, not this population, is designed to apply to TSV pools.
+*Population.* Bell's data come from four tokens, TSLAx, AAPLx, NVDAx and SPYx, traded on public AMM pools on Solana, not on a TSV. We make no representation that they are Tokenized NMS Stock: the Order excludes an asset that "provides synthetic exposure to an underlying security" (Section I, p. 2). The method, not this population, is designed to apply to TSV pools. As of September 24, 2026, Bell's latest publication covers sessions of September 16, 2026 for TSLAx, AAPLx and SPYx, from 3,110, 2,619 and 2,244 on-chain fills respectively.
 
-*Question 3.* For each session (weekday overnight, weekend, holiday), Bell publishes g = ln(P_session / P_close), where P_session is the volume-weighted average price, per underlying share, of the token's on-chain fills, and P_close the last consolidated closing price. We apply the Table 4 statistic of Cong, Landsman, Rabetti, Zhang and Zhao, "Tokenized Stocks" (December 2025, p. 32): the share of observations deviating from the last close beyond a threshold.
+*Question 3.* For each session (weekday overnight, weekend, holiday), Bell publishes g = ln(P_session / P_close), where P_session is the volume-weighted average price, per underlying share, of the token's on-chain fills, and P_close the last consolidated closing price, cross-read on a second source. We apply the Table 4 statistic of Cong, Landsman, Rabetti, Zhang and Zhao, "Tokenized Stocks" (<<REF: cong_ssrn | identifiant SSRN du papier, format de remplissage « SSRN 5937314 » ; candidat 5937314 = nom du fichier local ssrn-5937314-tokenized-stocks.txt et note L6 l.1, absent du texte du papier (SOURCES Q3-8) | source attendue : confirmation par l'investisseur sur la page SSRN du papier (titre, auteurs, date) ; lecture sur place de l'orchestrateur non aboutie le 2026-09-24 (vérification anti-bot, non contournée, CHANTIERS:1426) ; si non confirmé : retirer ce placeholder et la virgule qui le suit, la citation par auteurs, titre et date reste>>, December 2025, p. 32): the share of observations deviating from the last close beyond a threshold.
 
 | Regime | Deviation from last close | Cong et al., Tesla xStock (share of hours) | Bell, TSLAx (share of sessions) |
 |---|---|---|---|
-| Weekday overnight | more than 1 percent | 71% | <<MESURE: t4_TSLAx_wkn_gt1 \| part des sessions overnight-weekday de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; unité : part des sessions ; format : entier suivi du signe pour cent, arrondi depuis la valeur à 2 décimales du rapport (arrondi déclaré au remplissage) \| source attendue : docs/MESURE-FONDATRICE-bell-2026-09.md, ligne overnight-weekday, agrégat exceed1/withGt, produit par node apps/bell/scripts/bell-report.mjs --founding --d9 (D9 de la course -b1-bis-ii) ; déclencheur : course -b1-bis-ii terminée et ancrée, item #11 livré>> |
+| Weekday overnight | more than 1 percent | 71% | <<MESURE: t4_TSLAx_wkn_gt1 \| part des sessions overnight-weekday de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; unité : part des sessions ; format : entier suivi du signe pour cent, arrondi depuis la valeur à 2 décimales du rapport (arrondi déclaré au remplissage) \| source attendue : docs/MESURE-FONDATRICE-bell-2026-09.md, ligne overnight-weekday, agrégat exceed1/withGt, produit par node apps/bell/scripts/bell-report.mjs --founding --d9 (D9 de la course -b1-bis-ii) ; déclencheur : course -b1-bis-ii terminée et ancrée, item #11 livré, et question licence tranchée avant tout remplissage (une part de sessions calculée à partir du close est-elle une valeur dérivée d'une source sous licence ? lecture du worker, RENDU-v4 §1) ; la publication seq 2 ne remplit pas ce champ (RENDU-v4 §3)>> |
 | Weekday overnight | more than 5 percent | 12% | <<MESURE: t4_TSLAx_wkn_gt5 \| idem, seuil : abs(exp(g)-1) supérieur à 5/100 \| source attendue : même rapport, agrégat exceed5/withGt ; même déclencheur>> |
 | Weekend | more than 1 percent | 15% | <<MESURE: t4_TSLAx_we_gt1 \| part des sessions weekend de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; même unité et format \| source attendue : même rapport, ligne weekend, agrégat exceed1/withGt ; même déclencheur>> |
 | Weekend | more than 5 percent | 0% | <<MESURE: t4_TSLAx_we_gt5 \| idem, seuil 5/100 \| source attendue : même rapport, ligne weekend, agrégat exceed5/withGt ; même déclencheur>> |
@@ -45,7 +45,7 @@
 
 This statistic describes the size and frequency of off-hours deviations from the last close. It measures no effect of overnight trading or of ten-minute reporting on the underlying market or on its opening, reopening or closing processes, and implies no causal link.
 
-*Question 6.* For each observation window, Bell publishes the ratio of the volume in its observed pools, recomputed from on-chain swaps counted once per transaction and converted to shares with the on-chain shares-per-token multiplier, to the underlying stock's consolidated average daily share volume over a period stated in its method. These pools are not TSVs; the ratio describes on-chain activity in the observed pools, not whether any venue is within a limit.
+*Question 6.* For each session, Bell publishes the ratio of the volume in its observed pools, recomputed from on-chain swaps counted once per transaction and converted to shares with the on-chain shares-per-token multiplier, to the underlying stock's average daily share volume in the calendar month before the session date. These pools are not TSVs; the ratio describes on-chain activity in the observed pools, not whether any venue is within a limit.
 
 ## 3. What the Commission could expect from a TSV's publication
 
@@ -53,15 +53,15 @@
 
 - *Recomputable from the ledger.* Each published transaction identifies its on-chain transaction, so that a third party could recompute its price, size, time and direction from the public, permissionless ledger (Section II.A, p. 18), and its dollar value from the declared conversion method.
 - *Named abstention.* When a value cannot be established, the publication gives a named reason instead of an estimate, and counts such cases.
-- *Published and anchored digest.* Each publication carries a digest of its content, published and anchored to a public timestamp, so that a later edit is detectable by recomputation.
+- *Signed and chained digest.* Publications are signed and hash-chained, each publication carrying the digest of its content and of the previous line, so that a later edit is detectable by recomputation with the published public key.
 - *Dated periods.* Each published volume states its period, measured back from a publication time "as determined by the TSV" (Section II.G, note 81, p. 29), and any figure read against a Tier limit names its denominator's month and source, so that a miscalculation in either term can be located.
 
 Bell applies these properties to its own records, outside the TSV framework:
 
-- *Recomputable.* For TSLAx, AAPLx and NVDAx, Bell established the multiplier history used for per-share prices from transaction-level ledger data, obtained through one operator's enumeration (Helius) and cross-read on a second endpoint for the multiplier events. A defective page, including a multiplier-event mismatch, is not recorded and stops the run; a run is complete only if a separate query for the latest transaction up to a pinned slot returns the last one recorded; a second method, scanning the transactions of the account authorized to update the multiplier, gave the same history, event for event. With the same closing price and consolidated volume, obtained under the reader's license and never republished by Bell, each gap and ratio can be recomputed bit for bit with the published replay code.
-- *Named abstention.* When a gap's closing price or multiplier cannot be established, Bell abstains with a named reason, for example no_close_ref for a missing closing price, and counts abstentions in its published state file.
-- *Anchored digests.* Each collection log is chained by SHA-256, and at each start, end and resumption of a run a manifest of its digests is submitted to OpenTimestamps: 15 of 15 anchor proofs upgraded to Bitcoin attestations on 2026-09-23. An anchor shows a log head existed before a Bitcoin block, not where its pages came from or that the scan ran. Bell's public timeline is chained line by line and signed with an Ed25519 key whose public half is published; a signature shows origin, not truth.
-- *Dated periods.* Each gap is keyed to the trading day of its closing price by a published rule, and each ratio is published with its observation window.
+- *Recomputable.* For TSLAx, AAPLx and NVDAx, Bell established the multiplier history used for per-share prices from transaction-level ledger data, obtained through one operator's enumeration and cross-read on a second endpoint for the multiplier events. A defective page, including a multiplier-event mismatch, is not recorded and stops the run; a run is complete only if a separate query for the latest transaction up to a pinned slot returns the last one recorded; a second method, scanning the transactions of the account authorized to update the multiplier, gave the same history, event for event. With the same closing price and daily share volumes, obtained under the reader's license and never republished by Bell, each gap and ratio can be recomputed with the formulas of Bell's published method.
+- *Named abstention.* When a gap's closing price or multiplier cannot be established, Bell abstains with a named reason and counts abstentions in its published state file: in its publication of September 23, 2026, all four TSLAx sessions abstained with no_close_ref, a missing closing price; in that of September 24, a gap is computed for each of its nine sessions.
+- *Signed and chained digests.* Bell's public timeline is chained line by line, each line carrying the digests of the files it publishes, and signed with an Ed25519 key whose public half is published; a signature shows origin, not truth. Timestamp anchoring of these publications is in preparation. The logs of the enumeration run described above are chained by SHA-256, and a manifest of their digests was submitted to OpenTimestamps at each start, end and resumption: as of September 24, 2026, all 16 proof files record a Bitcoin block (not checked against a node). An anchor shows a log head existed before a Bitcoin block, not where its pages came from or that the scan ran.
+- *Dated periods.* Each gap is keyed to the trading day of its closing price by a published rule, and each ratio is published with its session window and the month of its denominator.
 
 Bell's records are published from a dedicated host operated by MONARK; the signing key is generated on it. We claim independence from the venues and issuers measured
 (<<INVESTISSEUR: relation_commerciale | déclaration à la date du dépôt, par exemple « no commercial relationship with the issuers or venues measured as of the filing date », texte exact de l'investisseur | source attendue : acte investisseur AI-5>>),
@@ -75,14 +75,14 @@
 
 ## 5. Availability
 
-State and timeline, including other symbols and the holiday regime:
-<<SERVI: url_state | attendu https://bell.monarkgate.tech/state.json, qui sert aussi les autres symboles, le régime holiday (ex-url_report, fondu) et les compteurs d'abstentions (champ residuals, ex-residual_counts) | preuve attendue : curl -sI sur l'URL, HTTP 200 au jour du dépôt, et test d'intégration non-LLM du chemin servi (règle Branchement) ; déclencheur : T-1b backend servi (DNS compris) ; phrases au présent qui en dépendent (RENDU-v3 §6) : « keeps a public, signed record », « Bell publishes g = », « Bell publishes the ratio », « counts abstentions in its published state file », « each ratio is published with its observation window », « Bell's records are published from a dedicated host » ; sinon pas de dépôt (NOTE-DEPOT C-1)>>,
-<<SERVI: url_timeline | attendu https://bell.monarkgate.tech/timeline.jsonl | preuve attendue : idem url_state ; déclencheur : T-1b backend servi ; phrases au présent qui en dépendent : « signed with an Ed25519 key whose public half is published » et la phrase sur la clé de signature (§3, paragraphe de l'hôte) ; sinon pas de dépôt (NOTE-DEPOT C-1)>>.
-Method (session bounds, formulas, periods, residuals), with the public key, the anchors and the replay code:
-<<SERVI: url_method | page /bell/method, hôte à confirmer par T-1b-site ; doit lier la clé publique, les manifestes et preuves OTS et le code de rejeu public (export apps/bell), et énoncer les périodes du ratio (fenêtre du numérateur, période du dénominateur) et la règle du jour du close | preuve attendue : curl -sI HTTP 200, liens effectifs vérifiés, validation visuelle investisseur (décision 73) ; sinon retirer « anyone can recompute », « bit for bit » et « with the published replay code », et réécrire « over a period stated in its method » et « by a published rule »>>.
+State and timeline:
+https://bell.monarkgate.tech/state.json,
+https://bell.monarkgate.tech/timeline.jsonl.
+Method (session bounds, formulas, periods, residuals), with the public key and the anchors:
+https://monarkgate.tech/bell/method.
 Contact:
-<<INVESTISSEUR: contact | adresse de contact publique, publiée sans expurgation (ordre p. 60) | source attendue : acte investisseur AI-9>>.
+<<INVESTISSEUR: contact | adresse de contact publique, publiée sans expurgation (ordre p. 60) ; candidat servi : bell@monarkgate.tech (pages /bell et /bell/method, lues le 2026-09-24) | source attendue : acte investisseur AI-9>>.
 
 Respectfully submitted,
 
-<<SIGNATAIRE>>
+<<SIGNATAIRE | nom, titre, organisation, tels qu'ils apparaîtront de façon permanente dans le champ public « Commenter Name » | source : acte investisseur AI-3>>
````
