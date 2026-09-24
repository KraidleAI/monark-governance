[INTERNAL DRAFT v2 - NOT FOR FILING. Every double-angle placeholder is filled from an anchored artifact, a served URL or an investor act before filing; each one names its source and trigger (full list: RENDU-v2.md). Remove this line before filing.]

<<DATE>>

Secretary
Securities and Exchange Commission
100 F Street NE
Washington, DC 20549-1090

**Re: File No. 4-927 - Release No. 34-106402 (September 17, 2026): comments on Questions 3 and 6**

**Summary.** MONARK Bell keeps a public, signed record of how tokens that track U.S. equities trade on public ledgers, in particular while U.S. markets are closed, designed so that anyone can recompute it. We comment on Questions 3 and 6 only. Under the Order, each venue computes its own volume against the limits and publishes its own transaction data, and the Commission asks how TSV trading may affect the underlying market. Bell answers with a method: first-hand ledger data, two data operators, anchored collection logs, replayable computations, fail-closed refusals and a declared budget.

## 1. What the Order asks, and what it relies on

The Commission expects that trading under the exemption "will help the Commission evaluate the impact of trading Tokenized NMS Stock ... on the national market system" (Section I.B, p. 14). It "intends to monitor closely the use of the exemptions" and "solicits public comment on all aspects of the exemptions" (Section VI, p. 57).

Several conditions rest on what each TSV computes and reports about itself. A TSV computes its own volume against the Tier limits (Section II.F, p. 24), publishes its own transaction data, updated within ten minutes (Section II.G, p. 28), and "must verify" that the token provides holders the same rights and privileges as the traditional stock (Section II.E, p. 23), describing in its Notice "the steps (e.g., audits, certifications, attestations)" it has taken (Section III, item i, p. 39). Such a TSV "would not be subject to the same books and records, examinations, and other oversight requirements" as exchanges and ATSs (Section II, p. 17), though it must consent to staff examinations "at any time" (Section II.L, p. 35).

The Commission recognizes that a TSV may inadvertently exceed a volume threshold, for example "due to a miscalculation in either a numerator or denominator" (Section II.F, p. 26). It notes the risk that TSV prices "could dislocate from the prices of the NMS stock in traditional format" and designs the volume limits "to help limit the potential impact of any price dislocations" (Section II.F, p. 28). It observes that the transparency provided by AMMs "may potentially obviate the need for certain regulations" (Section I.B, p. 12), requires TSV applications to be deployed on a public, permissionless distributed ledger (Section II.A, p. 18), and lists third-party audits and "public auditability of the distributed ledger" among the audit types a TSV may describe (Section III, item x, p. 44).

Question 3 asks how TSV trading could "potentially impact the liquidity, pricing, or trading of underlying NMS stock", and what effects ten-minute reporting and "overnight trading" could have on market quality (Section VI, Question 3, pp. 57-58). Question 6 asks whether the Tier 1 and Tier 2 limits are appropriate (Section VI, Question 6, p. 58). Both concern quantities that Bell measures outside the venues.

## 2. What Bell measures on Questions 3 and 6

*Population.* Bell's data today come from four tokens, TSLAx, AAPLx, NVDAx and SPYx, traded on public automated market maker pools on Solana. They are not traded on a TSV, and we make no representation that they are Tokenized NMS Stock: the Order excludes an asset that "provides synthetic exposure to an underlying security" (Section I, p. 2). The method transfers to TSV pools; the population does not.

*Question 3.* For each declared session (weekday overnight, weekend, holiday), Bell publishes g = ln(P_session / P_close), where P_session is the volume-weighted average price, per underlying share, of the token's on-chain fills in the session, and P_close is the last consolidated closing price. We apply the statistic of Table 4 in Lin William Cong, Wayne Landsman, Daniel Rabetti, Che Zhang and Wenqi Zhao, "Tokenized Stocks" (December 2025, p. 32): the share of observations in which the token deviates from the last close by more than 1, 2 and 5 percent.

| Regime | Deviation from last close | Cong et al., Tesla xStock (share of hours) | Bell, TSLAx (share of sessions) |
|---|---|---|---|
| Weekday overnight | more than 1 percent | 71% | <<MESURE: t4_TSLAx_wkn_gt1 \| part des sessions overnight-weekday de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; unité : part des sessions ; format : entier suivi du signe pour cent, arrondi depuis la valeur à 2 décimales du rapport (arrondi déclaré au remplissage) \| source attendue : docs/MESURE-FONDATRICE-bell-2026-09.md, ligne overnight-weekday, agrégat exceed1/withGt, produit par node apps/bell/scripts/bell-report.mjs --founding --d9 (D9 de la course -b1-bis-ii) ; déclencheur : course -b1-bis-ii terminée et ancrée, item #11 livré>> |
| Weekday overnight | more than 2 percent | 57% | <<MESURE: t4_TSLAx_wkn_gt2 \| idem, seuil : abs(exp(g)-1) supérieur à 2/100 \| source attendue : même rapport, agrégat exceed2/withGt ; bell-report.mjs n'agrège aujourd'hui que exceed1 et exceed5 (fonction aggregate, l.52-70), extension exigée (item I-v2-3) ; même déclencheur>> |
| Weekday overnight | more than 5 percent | 12% | <<MESURE: t4_TSLAx_wkn_gt5 \| idem, seuil : abs(exp(g)-1) supérieur à 5/100 \| source attendue : même rapport, agrégat exceed5/withGt ; même déclencheur>> |
| Weekend | more than 1 percent | 15% | <<MESURE: t4_TSLAx_we_gt1 \| part des sessions weekend de TSLAx, parmi celles où g est calculé, telles que abs(exp(g)-1) est supérieur à 1/100 ; même unité et format \| source attendue : même rapport, ligne weekend, agrégat exceed1/withGt ; même déclencheur>> |
| Weekend | more than 2 percent | 8% | <<MESURE: t4_TSLAx_we_gt2 \| idem, seuil 2/100 \| source attendue : même rapport, ligne weekend, agrégat exceed2/withGt (extension item I-v2-3) ; même déclencheur>> |
| Weekend | more than 5 percent | 0% | <<MESURE: t4_TSLAx_we_gt5 \| idem, seuil 5/100 \| source attendue : même rapport, ligne weekend, agrégat exceed5/withGt ; même déclencheur>> |

Cong et al.: share of observed hours, September-October 2025 (weekday: overnight hours Monday-Thursday; weekend: Friday 4 p.m. to Monday 9:30 a.m.). Bell: share of sessions over
<<MESURE: window_TSLAx | fenêtre effective en dates UTC, format « July 1 to October 31, 2025 », ou bornes réduites par pool déclarées (ADR-T1aii C-11) | source attendue : provenance de la course -b1-bis-ii (bornes épinglées, ADR-T1aii D1-bis l.61) et docs/MESURE-FONDATRICE-bell-2026-09.md>>,
with
<<MESURE: n_TSLAx_wkn | nombre entier de sessions overnight-weekday avec g calculé (dénominateur des trois parts) | source attendue : docs/MESURE-FONDATRICE-bell-2026-09.md, colonne « n with g_t », ligne overnight-weekday>>
weekday overnight and
<<MESURE: n_TSLAx_we | nombre entier de sessions weekend avec g calculé | source attendue : même rapport, colonne « n with g_t », ligne weekend>>
weekend sessions. Units, closing-price sources, samples and session definitions differ; the comparison is descriptive. Other symbols and the holiday regime:
<<SERVI: url_report | URL publique du rapport (autres symboles et régime holiday) | preuve attendue : curl -sI sur l'URL, HTTP 200 au jour du dépôt, et test d'intégration non-LLM du chemin servi (règle Branchement) ; déclencheur : T-1b servi>>.

This statistic describes the size and frequency of off-hours deviations from the last close. It measures no effect on the underlying market, its opening, reopening or closing processes, or of ten-minute reporting, and implies no causal link.

*Question 6.* For each session, Bell publishes the ratio of the volume traded in the pools it observes to the prior month's consolidated average daily share volume. The numerator is recomputed from on-chain swap records, counted once per transaction signature and converted to shares with the token's on-chain multiplier; only the ratio is published. Aggregated to the monthly arithmetic of Section II.F (p. 24), the ratio over
<<MESURE: window_q6 | mois civils couverts, format « July to October 2025 » | source attendue : agrégat mensuel à créer (item I-5 : définition, épinglage dans bell-report, test non-LLM) appliqué au vol_ratio de state.json de la course -b1-bis-ii ou de T-1b ; NON dérivable des artefacts du crosscheck go-1 (ledger sans corps de swap, constat V-7) ; si I-5 n'est pas livré au dépôt : retirer toute la phrase « Aggregated ... (Section II.F, p. 24). »>>
was
<<MESURE: volm_TSLAx | moyenne des volumes journaliers des pools observés, en actions via le multiplicateur on-chain, divisée par l'ADV consolidé du mois précédent ; nombre décimal à 3 décimales suivi du mot percent | source attendue : sortie de l'agrégat I-5 pour TSLAx ; même condition que window_q6>>
(TSLAx),
<<MESURE: volm_AAPLx | idem pour AAPLx | source attendue : sortie de l'agrégat I-5 pour AAPLx ; même condition>>
(AAPLx),
<<MESURE: volm_NVDAx | idem pour NVDAx | source attendue : sortie de l'agrégat I-5 pour NVDAx ; même condition>>
(NVDAx) and
<<MESURE: volm_SPYx | idem pour SPYx | source attendue : sortie de l'agrégat I-5 pour SPYx ; même condition>>
(SPYx), to be read against the 0.25 percent (Tier 1) and 2.5 percent (Tier 2) limits (Section II.F, p. 24). These pools are not TSVs; the ratio describes on-chain activity in the observed pools, not whether any venue is within a limit.

## 3. Our method: a record anyone can recompute

The method, more than any single figure, is what we offer while TSVs begin to operate.

- *First-hand data, logged as collected.* Bell reads raw transactions from the public ledger, not a derived data feed. Stating prices per underlying share requires each token's on-chain multiplier over time; to establish it, Bell listed every transaction of each token's mint, from its initialization to a pinned slot, in pages of up to 1,000 transactions: 8,783,173 transactions in 8,784 pages for TSLAx, 2,628,814 in 2,629 for AAPLx, 8,828,036 in 8,829 for NVDAx, and
  <<MESURE: nexact_SPYx | n_exact et pages de SPYx, format « N,NNN,NNN in N,NNN » | source attendue : crosscheck-SPYx.json du répertoire de fin de SPYx, sha256 listé dans le manifeste mint_end-SPYx (docs/course-bell/ANCHORS.md) ; si le scan est incomplet ou le verdict n'est pas equal : réécrire la phrase, aucun chiffre d'un tirage incomplet>>
  for SPYx. Each page is appended, as it is fetched, to a log whose entries are chained by SHA-256, so that a later edit is detectable by recomputation once the log head is published or anchored.
- *Two data operators.* A run requires two distinct operators. The pages come from one operator, Helius, the only one we found offering this enumeration; every multiplier event found in them is re-read from Solana's public mainnet endpoint, and a mismatch stops the run. A second method, which scans the transactions of the account authorized to update the multiplier, gave the same history, event for event, for TSLAx, AAPLx and NVDAx (verdict equal); SPYx:
  <<MESURE: verdict_SPYx | verdict du comparateur de SPYx, format « equal » ou verdict et raison tels quels | source attendue : comparator_verdict.verdict de crosscheck-SPYx.json, fichier listé dans le manifeste mint_end-SPYx ; si le verdict n'est pas equal : réécrire la phrase>>.
- *Complete pages, fail-closed.* Every page but the last must be full, and a page with an unreadable transaction or an out-of-order slot is not recorded: the run stops and resumes from its last recorded page. A run is declared complete only if the enumeration is exhausted and a separate query for the latest transaction up to the pinned slot returns the last transaction recorded; for the three completed mints, the short last page was accepted this way, after the next request returned nothing.
- *Declared budget.* Each run has a call ceiling fixed at launch; reaching it stops the run as budget_exhausted instead of presenting a partial enumeration as complete, and the calls used are recorded by method.
- *Anchored.* At the start, end and each resumption of a run, a manifest of the SHA-256 digests of its logs and result files is submitted to OpenTimestamps; a stamp becomes checkable against a Bitcoin block once its proof is upgraded
  (<<MESURE: ots_upgraded | nombre de preuves OTS mises à niveau (rattachées à un bloc Bitcoin) sur le nombre de frontières ancrées, format « N of M proofs upgraded as of Month D, YYYY » | source attendue : ots upgrade puis ots verify sur docs/course-bell/*.ots avec le client épinglé (FAITS-opentimestamps l.26-27) ; état au 2026-09-23T05:00Z : aucune preuve mise à niveau sur 15 (constat V-4)>>).
  An anchor shows that a log head existed before that block; it does not show where the pages came from or that the scan ran.
- *Recomputable.* Given the same closing price and consolidated volume, obtained under the reader's own data license, each published gap and ratio can be recomputed bit for bit from public ledger data with the published replay code; Bell never republishes those licensed inputs.
- *Signed.* Each line of the public timeline is signed with an Ed25519 key whose public half is published. A signature shows which host published a line, not that the fact is true.
- *Independent of the venues.* Bell's records are published and signed on a separate host that runs only Bell and an external monitoring probe; it is operated and deployed by the MONARK orchestrator, and the signing key never leaves it. We claim independence from the venues and issuers measured
  (<<INVESTISSEUR: relation_commerciale | déclaration à la date du dépôt, par exemple « no commercial relationship with the issuers or venues measured as of the filing date », texte exact de l'investisseur | source attendue : acte investisseur AI-5>>),
  not from MONARK.
- *Declared abstention.* When an input is missing or cannot be established, Bell abstains and publishes a named reason instead of an estimate, for example no_close_ref (no closing price), rebase_unverified (token multiplier not established over the window) or no_quorum (fewer than two data operators answered). Abstentions are counted and published
  (<<MESURE: residual_counts | compteurs d'abstentions par résidu sur les fenêtres citées, format « code: N » séparés par des virgules, ou renvoi au champ residuals de state.json | source attendue : state.json de la course -b1-bis-ii ou de T-1b (test bell_abstentions_counted)>>).
  Bell publishes no rating and no probability for any event.

## 4. Declared limits

- Bell cannot detect a transaction omitted inside an otherwise complete page returned by the operator. The rules above protect only the ends of an enumeration; for the multiplier history, the second method reduces this risk without removing it.
- Sample: four symbols from one token family on one chain, traded outside the TSV framework, pools identified on-chain, the windows stated above. Results do not extend to other tokens, chains or TSVs. A future version of Bell is intended to cover other distribution channels for the same underlying securities, such as the near.com offering with Ondo announced on September 22, 2026, where the quantities involved are public and recomputable.
- Bell is neither a TSV nor a Covered Firm. It does not assess compliance with any condition of the Order, and its records are not a certification.

## 5. Availability

State and timeline:
<<SERVI: url_state | attendu https://bell.monarkgate.tech/state.json | preuve attendue : curl -sI sur l'URL, HTTP 200 au jour du dépôt, et test d'intégration non-LLM du chemin servi ; déclencheur : T-1b backend servi (DNS compris)>>,
<<SERVI: url_timeline | attendu https://bell.monarkgate.tech/timeline.jsonl | preuve attendue : idem url_state ; déclencheur : T-1b backend servi>>.
Method (session bounds, formulas, residual list), with links to the public key, the anchors and the replay code:
<<SERVI: url_method | page /bell/method, hôte à confirmer par T-1b-site ; doit lier la clé publique, les manifestes et preuves OTS, et le code de rejeu public (export apps/bell) | preuve attendue : curl -sI HTTP 200, liens effectifs vérifiés, validation visuelle investisseur (décision 73) ; sinon retirer « anyone can recompute » et « with the published replay code »>>.
Contact:
<<INVESTISSEUR: contact | adresse de contact publique, publiée sans expurgation (ordre p. 60) | source attendue : acte investisseur AI-9>>.

Respectfully submitted,

<<SIGNATAIRE>>
