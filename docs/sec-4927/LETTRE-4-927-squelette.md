[INTERNAL DRAFT - NOT FOR FILING. Every <BELL:...>, <INVESTISSEUR:...> and <REF:...> placeholder is filled from anchored artifacts or by an investor act before filing (see NOTE-DEPOT.md and SOURCES.md). Remove this line and every bracketed OPTION before filing.]

<INVESTISSEUR:date_de_depot>

Secretary
Securities and Exchange Commission
100 F Street NE
Washington, DC 20549-1090

**Re: File No. 4-927 - Release No. 34-106402 (September 17, 2026): comments on Questions 3 and 6**

**Summary.** MONARK Bell keeps a public, signed record of how tokens that track U.S. equities trade on public ledgers, in particular while U.S. markets are closed, designed so that anyone can recompute it. We comment on Questions 3 and 6 only: for each, what Bell measures, how a third party can recompute it, and what it does not establish.

## 1. What the Order says

The Commission expects that trading under the exemption "will help the Commission evaluate the impact of trading Tokenized NMS Stock ... on the national market system" (p. 14, ll. 570-572). It "intends to monitor closely the use of the exemptions" and "solicits public comment on all aspects of the exemptions" (p. 57, ll. 2028-2030).

Several conditions rest on what the TSV itself does and reports. It "must verify" that holders get the rights and privileges of the traditional stock (condition E, p. 23, ll. 870-872) and describes in its Notice "the steps (e.g., audits, certifications, attestations)" taken (item i, p. 39, ll. 1456-1458). It computes its own volume ratio (condition F, p. 24, ll. 902-908), publishes its own transaction data, updated within ten minutes (condition G, p. 28, ll. 1085-1088), stops trading concurrently with a stoppage on the primary listing exchange (condition H, p. 30, ll. 1140-1142) and engages in no financing activity (condition J, p. 32, l. 1256). Such a TSV "would not be subject to the same books and records, examinations, and other oversight requirements" as exchanges and ATSs (p. 17, ll. 672-673), though it consents to staff examination "at any time" (p. 35, ll. 1336-1337). Third-party audits appear as examples of systems-safeguard procedures a TSV may describe; a TSV without such procedures must "state so in the Notice" (item x, p. 44, ll. 1603-1610). The word "independent" does not appear in the Order.

The Order also notes that "transaction, price movement, and participant interaction transparency provided by AMMs, may potentially obviate the need for certain regulations" (p. 12, ll. 463-465), and that public deployment of TSV smart contracts empowers "participants and third parties to audit and report vulnerabilities" (p. 19, ll. 728-729, a passage about smart-contract code). It anticipates that TSV prices "could dislocate from the prices of the NMS stock in traditional format" (p. 28, ll. 1073-1074), sets the volume limits "to help limit the potential impact of any price dislocations" (p. 28, ll. 1076-1077), and recognizes that a TSV may exceed a limit "due to a miscalculation in either a numerator or denominator" (p. 26, ll. 1012-1013).

Question 3 asks how TSV trading could "potentially impact the liquidity, pricing, or trading of underlying NMS stock", and what effects ten-minute reporting and "overnight trading" could have on market quality (pp. 57-58, ll. 2039-2048). Question 6 asks whether the Tier 1 and Tier 2 limits are appropriate (p. 58, ll. 2057-2064). Both concern quantities that Bell measures.

## 2. What Bell measures on Questions 3 and 6

*Population.* Bell's data today come from four tokens, TSLAx, AAPLx, NVDAx and SPYx, traded on public automated market maker pools on Solana. They are not traded on a TSV, and we make no representation that they are Tokenized NMS Stock: the Order excludes an asset that "provides synthetic exposure to an underlying security" (p. 2, l. 30). The method transfers to TSV pools; the population does not.

*Question 3.* For each declared session (weekday overnight, weekend, holiday), Bell publishes g = ln(P_session / P_close), where P_session is the volume-weighted average price, per underlying share, of the token's on-chain fills in the session, and P_close is the last consolidated closing price. We apply the statistic of Table 4 in Cong, Landsman, Rabetti, Zhang and Zhao, "Tokenized Stocks" (December 2025, p. 32; <REF:cong_ssrn|confirm SSRN abstract id>): the share of observations in which the token deviates from the last close by more than 1, 2 and 5 percent.

| Deviation from last close | Cong et al., Tesla xStock, weekday | Cong et al., weekend | Bell, TSLAx, weekday overnight | Bell, weekend |
|---|---|---|---|---|
| more than 1 percent | 71% of hours | 15% of hours | <BELL:t4_TSLAx_wkn_gt1\|MESURE-FONDATRICE> of sessions | <BELL:t4_TSLAx_we_gt1\|MESURE-FONDATRICE> of sessions |
| more than 2 percent | 57% | 8% | <BELL:t4_TSLAx_wkn_gt2\|MESURE-FONDATRICE> | <BELL:t4_TSLAx_we_gt2\|MESURE-FONDATRICE> |
| more than 5 percent | 12% | 0% | <BELL:t4_TSLAx_wkn_gt5\|MESURE-FONDATRICE> | <BELL:t4_TSLAx_we_gt5\|MESURE-FONDATRICE> |

Cong et al.: share of observed hours, September-October 2025 (weekday: Monday-Thursday overnight hours; weekend: Friday 4 p.m. to Monday 9:30 a.m.). Bell: share of sessions over <BELL:window_TSLAx|MESURE-FONDATRICE>, with <BELL:n_TSLAx_wkn|MESURE-FONDATRICE> weekday overnight and <BELL:n_TSLAx_we|MESURE-FONDATRICE> weekend sessions. Units, closing-price sources, samples and session definitions differ; the comparison is descriptive. Other symbols and the holiday regime: <BELL:url_report|public report T-1b>.

This statistic describes how large and how frequent off-hours deviations from the last close are. It is an input to, not a measure of, any effect on the underlying market, on its opening, reopening or closing processes, or of ten-minute reporting, and it implies no causal link.

*Question 6.* For each session, Bell publishes the ratio of the volume traded in the pools it observes to the prior month's consolidated average daily share volume. The numerator is recomputed from on-chain swap records, counted once per transaction signature and converted to shares with the token's on-chain multiplier; only the ratio is published. [COND I-5 - keep only once the monthly aggregate is defined, pinned and tested: Aggregated to the monthly arithmetic of condition F (p. 24, ll. 902-906), the ratio over <BELL:window_q6|state.json> was <BELL:volm_TSLAx|bell-report F-aggregate> (TSLAx), <BELL:volm_AAPLx|bell-report F-aggregate> (AAPLx), <BELL:volm_NVDAx|bell-report F-aggregate> (NVDAx) and <BELL:volm_SPYx|bell-report F-aggregate> (SPYx), to be read against the 0.25 percent (Tier 1) and 2.5 percent (Tier 2) limits (p. 24, ll. 896-902).] These pools are not TSVs; the ratio describes current on-chain activity, not whether any venue is within a limit.

## 3. Our method: a record anyone can recompute

The method, more than any single figure, is what we offer while TSVs begin to operate.

- *Recomputable.* Given the same closing price and consolidated volume, obtained under the reader's own data license, each published gap and ratio can be recomputed bit for bit from public ledger data with the published replay code; Bell never republishes those licensed inputs. Collection ledgers and the public timeline are hash-chained, so a later edit is detectable by recomputation once the chain head is published or anchored.
- *Signed.* Each line of the public timeline is signed with an Ed25519 key whose public half is published. A signature shows which host published a line, not that the fact is true; only recomputation bears on the fact.
- *Anchored.* At the start, end and each resumption of a collection run, a manifest of the SHA-256 digests of its ledgers and reports is time-stamped with OpenTimestamps and later tied to a Bitcoin block (<BELL:anchored_runs|ANCHORS.md>). An anchor shows that a chain head existed before that block; it does not show where the pages came from or that the scan ran.
- *Independent of the venues.* Bell's records are published and signed on a separate host that runs only Bell and an external monitoring probe; it is operated and deployed by the MONARK orchestrator, and the signing key never leaves it. We claim independence from the venues and issuers measured (<INVESTISSEUR:relation_commerciale|statement as of filing date>), not from MONARK.
- *Declared abstention.* When an input is missing or cannot be established, Bell abstains and publishes a named reason instead of an estimate, for example no_close_ref (no closing price), rebase_unverified (token multiplier not established over the window) or no_quorum (fewer than two data operators answered). Abstentions are counted and published (<BELL:residual_counts|state.json>). Bell publishes no rating and no probability for any event. [OPTION - keep only if served at filing: Statistical cells with too few observations are reported as under_calib.]
- *Two data operators.* On-chain reads use two distinct operators wherever the same method exists on both. A historical enumeration offered by a single operator carries a named residual (authority_scan_mono_operator); the events it finds and the token's final on-chain state are re-read from two operators, and a second, exhaustive method on the same operator, listing every transaction of the token, re-derives it (<BELL:crosscheck_verdicts|crosscheck-report.json>).
- *Complete pages.* A page shorter than full is kept only if a follow-up request with the same continuation returns nothing and an independent query for the latest transaction up to a pinned slot returns the page's last entry; otherwise the run stops. An interrupted run resumes from its last durable entry, and each resumption is anchored.

A third-party record complements the venue reporting of condition G: it does not depend on the venue, is recomputed from the public ledger that condition A requires (p. 18, ll. 694-695), and states what it does not compute. [OPTION - forward-looking, investor go: We intend to apply the same method to TSV pools once they operate.]

## 4. Declared limits

- Bell cannot detect a transaction omitted inside an otherwise complete page returned by a data operator. The rules above protect the ends of an enumeration; two-operator reads and the exhaustive re-derivation reduce this risk without removing it. Some historical enumerations rely on a single operator.
- Sample: four symbols from one token family on one chain, traded outside the TSV framework, pools identified on-chain, the windows stated above. Results do not extend to other tokens, chains or TSVs.
- Bell is neither a TSV nor a Covered Firm. It does not assess compliance with any condition of the Order, and its records are not a certification.

## 5. Availability

State and timeline: <BELL:url_state|expected https://bell.monarkgate.tech/state.json>, <BELL:url_timeline|expected https://bell.monarkgate.tech/timeline.jsonl>. Method (session bounds, formulas, residual list), with links to the public key, anchors and replay code: <BELL:url_method|expected /bell/method; must link url_pubkey, url_anchors, url_replay>. Contact: <INVESTISSEUR:contact>.

Respectfully submitted,

<INVESTISSEUR:signataire|name, title, organization - public Commenter Name field>
