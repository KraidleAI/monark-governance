[INTERNAL DRAFT v3 - NOT FOR FILING. Every double-angle placeholder is filled from an anchored artifact, a served URL or an investor act before filing; each one names its source and trigger (full list: RENDU-v3.md). Remove this line before filing.]

<<DATE>>

Via the Commission's internet comment form
Vanessa A. Countryman, Secretary
Securities and Exchange Commission
100 F Street NE
Washington, DC 20549-1090

**Re: File No. 4-927 - Release No. 34-106402 (September 17, 2026): Questions 1, 3, 5 and 6**

Dear Ms. Countryman:

**Summary.** MONARK Bell keeps a public, signed record of how tokens that track U.S. equities trade on public ledgers, in particular while U.S. markets are closed, designed so that anyone can recompute it. On Questions 3 and 6, we report what Bell measures and suggest four properties that the Commission could expect from a TSV's publication under Section II.G, so that a third party could recompute what a venue reports; Bell applies them to its own records.

## 1. What the Order asks, and what it relies on

The Commission "intends to monitor closely the use of the exemptions" (Section VI, p. 57). Several conditions rest on what each TSV reports about itself. A TSV computes its volume against the Tier limits (Section II.F, p. 24) and publishes its transaction data "in a machine-readable format" (Section II.G, p. 28). Such a TSV "would not be subject to the same books and records, examinations, and other oversight requirements" as exchanges and ATSs (Section II, p. 17), though it must consent to staff examinations "at any time" (Section II.L, p. 35).

The Commission recognizes that a TSV may inadvertently exceed a volume threshold, for example "due to a miscalculation in either a numerator or denominator" (Section II.F, p. 26), and designs the volume limits "to help limit the potential impact of any price dislocations" (Section II.F, p. 28). It observes that automated market maker (AMM) transparency "may potentially obviate the need for certain regulations" (Section I.B, p. 12) and lists "public auditability of the distributed ledger" among the audit types a TSV may describe (Section III, item x, p. 44).

Question 3 asks how TSV trading could "potentially impact the liquidity, pricing, or trading of underlying NMS stock", the effects of ten-minute reporting and "overnight trading" on market quality, and what, if any, modifications "should be made to the TSV Exemption" (Section VI, Question 3, pp. 57-58). Question 6 asks whether the Tier limits are appropriate and invites modifications (Question 6, p. 58). Both concern quantities that Bell measures outside the venues.

## 2. What Bell measures on Questions 3 and 6

*Population.* Bell's data come from four tokens, TSLAx, AAPLx, NVDAx and SPYx, traded on public AMM pools on Solana, not on a TSV. We make no representation that they are Tokenized NMS Stock: the Order excludes an asset that "provides synthetic exposure to an underlying security" (Section I, p. 2). The method, not this population, is designed to apply to TSV pools.

*Question 3.* For each session (weekday overnight, weekend, holiday), Bell publishes g = ln(P_session / P_close), where P_session is the volume-weighted average price, per underlying share, of the token's on-chain fills, and P_close the last consolidated closing price. We apply the Table 4 statistic of Cong, Landsman, Rabetti, Zhang and Zhao, "Tokenized Stocks" (December 2025, p. 32): the share of observations deviating from the last close beyond a threshold.

| Regime | Deviation from last close | Cong et al., Tesla xStock (share of hours) | Bell, TSLAx (share of sessions) |
|---|---|---|---|
| Weekday overnight | more than 1 percent | 71% | <<MESURE: t4_TSLAx_wkn_gt1 \| part des sessions overnight-weekday de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; unité : part des sessions ; format : entier suivi du signe pour cent, arrondi depuis la valeur à 2 décimales du rapport (arrondi déclaré au remplissage) \| source attendue : docs/MESURE-FONDATRICE-bell-2026-09.md, ligne overnight-weekday, agrégat exceed1/withGt, produit par node apps/bell/scripts/bell-report.mjs --founding --d9 (D9 de la course -b1-bis-ii) ; déclencheur : course -b1-bis-ii terminée et ancrée, item #11 livré>> |
| Weekday overnight | more than 5 percent | 12% | <<MESURE: t4_TSLAx_wkn_gt5 \| idem, seuil : abs(exp(g)-1) supérieur à 5/100 \| source attendue : même rapport, agrégat exceed5/withGt ; même déclencheur>> |
| Weekend | more than 1 percent | 15% | <<MESURE: t4_TSLAx_we_gt1 \| part des sessions weekend de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; même unité et format \| source attendue : même rapport, ligne weekend, agrégat exceed1/withGt ; même déclencheur>> |
| Weekend | more than 5 percent | 0% | <<MESURE: t4_TSLAx_we_gt5 \| idem, seuil 5/100 \| source attendue : même rapport, ligne weekend, agrégat exceed5/withGt ; même déclencheur>> |

Cong et al.: share of observed hours, September-October 2025; they also report a 2 percent threshold. Bell: share of sessions over
<<MESURE: window_TSLAx | fenêtre effective en dates UTC, format « July 1 to October 31, 2025 », ou bornes réduites par pool déclarées (ADR-T1aii C-11) | source attendue : provenance de la course -b1-bis-ii (bornes épinglées, ADR-T1aii D1-bis l.61) et docs/MESURE-FONDATRICE-bell-2026-09.md>>,
with
<<MESURE: n_TSLAx_wkn | nombre entier de sessions overnight-weekday avec g calculé (dénominateur des deux parts de la ligne) | source attendue : docs/MESURE-FONDATRICE-bell-2026-09.md, colonne « n with g_t », ligne overnight-weekday>>
weekday overnight and
<<MESURE: n_TSLAx_we | nombre entier de sessions weekend avec g calculé (dénominateur des deux parts de la ligne) | source attendue : même rapport, colonne « n with g_t », ligne weekend>>
weekend sessions. Units, closing-price sources, samples and session definitions differ; the comparison is descriptive.

This statistic describes the size and frequency of off-hours deviations from the last close. It measures no effect of overnight trading or of ten-minute reporting on the underlying market or on its opening, reopening or closing processes, and implies no causal link.

*Question 6.* For each observation window, Bell publishes the ratio of the volume in its observed pools, recomputed from on-chain swaps counted once per transaction and converted to shares with the on-chain shares-per-token multiplier, to the underlying stock's consolidated average daily share volume over a period stated in its method. These pools are not TSVs; the ratio describes on-chain activity in the observed pools, not whether any venue is within a limit.

## 3. What the Commission could expect from a TSV's publication

In answer to the requests for modifications in Questions 1, 3, 5 and 6, we suggest four properties that the Commission could expect from a TSV's transaction data under Section II.G. None changes a limit; each lets a third party recompute what a venue reports.

- *Recomputable from the ledger.* Each published transaction identifies its on-chain transaction, so that a third party could recompute its price, size, time and direction from the public, permissionless ledger (Section II.A, p. 18), and its dollar value from the declared conversion method.
- *Named abstention.* When a value cannot be established, the publication gives a named reason instead of an estimate, and counts such cases.
- *Published and anchored digest.* Each publication carries a digest of its content, published and anchored to a public timestamp, so that a later edit is detectable by recomputation.
- *Dated periods.* Each published volume states its period, measured back from a publication time "as determined by the TSV" (Section II.G, note 81, p. 29), and any figure read against a Tier limit names its denominator's month and source, so that a miscalculation in either term can be located.

Bell applies these properties to its own records, outside the TSV framework:

- *Recomputable.* For TSLAx, AAPLx and NVDAx, Bell established the multiplier history used for per-share prices from transaction-level ledger data, obtained through one operator's enumeration (Helius) and cross-read on a second endpoint for the multiplier events. A defective page, including a multiplier-event mismatch, is not recorded and stops the run; a run is complete only if a separate query for the latest transaction up to a pinned slot returns the last one recorded; a second method, scanning the transactions of the account authorized to update the multiplier, gave the same history, event for event. With the same closing price and consolidated volume, obtained under the reader's license and never republished by Bell, each gap and ratio can be recomputed bit for bit with the published replay code.
- *Named abstention.* When a gap's closing price or multiplier cannot be established, Bell abstains with a named reason, for example no_close_ref for a missing closing price, and counts abstentions in its published state file.
- *Anchored digests.* Each collection log is chained by SHA-256, and at each start, end and resumption of a run a manifest of its digests is submitted to OpenTimestamps: 15 of 15 anchor proofs upgraded to Bitcoin attestations on 2026-09-23. An anchor shows a log head existed before a Bitcoin block, not where its pages came from or that the scan ran. Bell's public timeline is chained line by line and signed with an Ed25519 key whose public half is published; a signature shows origin, not truth.
- *Dated periods.* Each gap is keyed to the trading day of its closing price by a published rule, and each ratio is published with its observation window.

Bell's records are published from a dedicated host operated by MONARK; the signing key is generated on it. We claim independence from the venues and issuers measured
(<<INVESTISSEUR: relation_commerciale | déclaration à la date du dépôt, par exemple « no commercial relationship with the issuers or venues measured as of the filing date », texte exact de l'investisseur | source attendue : acte investisseur AI-5>>),
not from MONARK.

## 4. Declared limits

- Bell cannot detect a transaction omitted inside an otherwise complete page returned by the operator; for the multiplier history, the second method reduces this risk without removing it.
- Sample: four symbols of one token family on one chain, outside the TSV framework, over the stated windows; results do not extend to other tokens, chains or TSVs.
- Bell is neither a TSV nor a Covered Firm. It does not assess compliance with any condition of the Order, and its records are not a certification.

## 5. Availability

State and timeline, including other symbols and the holiday regime:
<<SERVI: url_state | attendu https://bell.monarkgate.tech/state.json, qui sert aussi les autres symboles, le régime holiday (ex-url_report, fondu) et les compteurs d'abstentions (champ residuals, ex-residual_counts) | preuve attendue : curl -sI sur l'URL, HTTP 200 au jour du dépôt, et test d'intégration non-LLM du chemin servi (règle Branchement) ; déclencheur : T-1b backend servi (DNS compris) ; phrases au présent qui en dépendent (RENDU-v3 §6) : « keeps a public, signed record », « Bell publishes g = », « Bell publishes the ratio », « counts abstentions in its published state file », « each ratio is published with its observation window », « Bell's records are published from a dedicated host » ; sinon pas de dépôt (NOTE-DEPOT C-1)>>,
<<SERVI: url_timeline | attendu https://bell.monarkgate.tech/timeline.jsonl | preuve attendue : idem url_state ; déclencheur : T-1b backend servi ; phrases au présent qui en dépendent : « signed with an Ed25519 key whose public half is published » et la phrase sur la clé de signature (§3, paragraphe de l'hôte) ; sinon pas de dépôt (NOTE-DEPOT C-1)>>.
Method (session bounds, formulas, periods, residuals), with the public key, the anchors and the replay code:
<<SERVI: url_method | page /bell/method, hôte à confirmer par T-1b-site ; doit lier la clé publique, les manifestes et preuves OTS et le code de rejeu public (export apps/bell), et énoncer les périodes du ratio (fenêtre du numérateur, période du dénominateur) et la règle du jour du close | preuve attendue : curl -sI HTTP 200, liens effectifs vérifiés, validation visuelle investisseur (décision 73) ; sinon retirer « anyone can recompute », « bit for bit » et « with the published replay code », et réécrire « over a period stated in its method » et « by a published rule »>>.
Contact:
<<INVESTISSEUR: contact | adresse de contact publique, publiée sans expurgation (ordre p. 60) | source attendue : acte investisseur AI-9>>.

Respectfully submitted,

<<SIGNATAIRE>>
