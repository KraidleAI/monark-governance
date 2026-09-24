# THREAD — MONARK v0.6.0 (written by the orchestrator on the investor's plan, decision 158; drafted 2026-09-24 00:2x UTC, after the tag)

Facts: release https://github.com/KraidleAI/Monark/releases/tag/v0.6.0 (2026-09-24 00:21 UTC, mirror 51a98f0); site https://monarkgate.tech; Bell host https://bell.monarkgate.tech (seq 1, 2026-09-23 21:35:52 UTC); verifier run from the public mirror at v0.6.0: `consistent_with_supplied_keyring`. Every figure below is read from a served file or a committed document named in docs/CHANTIERS.md.

1/ MONARK v0.6.0 is out. Tonight we shipped the first served piece of the fleet: MONARK Bell, a signed public record of how tokenized U.S. equities trade on a public ledger. Here is what is in the release, technically and economically, then Bell, Ukemi, Narabi, and what comes next.

2/ What the release carries, technically. Every read we pay for goes through one budget guard: a hash-chained ledger line is written and synced to disk before the RPC call leaves, so a crash can over-count, never under-count. Budgets are per operator and per method, with floors and caps.

3/ Every on-chain fact needs two distinct operators to agree (quorum of two). When an operator deviates, it is excluded by name for the run; the quorum never drops below two. The prober that reads the lending books proved it this week: a deviant operator was excluded and the replay matched the first pass byte for byte.

4/ Economically: paid reads are metered in the ledger, reconciled against the operators' own dashboards, and unlocked only through a served command. No silent overspend, no key in a config file: the signing key lives on the host under a system credential, never in the repository.

5/ MONARK Bell, the site: https://monarkgate.tech/bell. What Bell measures, the method, the anchors (17 lines, each with an OpenTimestamps proof and a Bitcoin block record), the terms and the privacy notice. The register now marks Bell built: it is served, attested, and verifiable by anyone.

6/ The host: https://bell.monarkgate.tech serves plain files. timeline.jsonl is append-only, each line carries the hash of the line before it and an Ed25519 signature. state.json is bound to the head line by SHA-256. The public key is served and committed in the repository as the trust root.

7/ The first record, seq 1, published 2026-09-23 21:35:52 UTC: TSLAx on Solana, one full New York trading day (16 Sep 2026, 08:00 UTC to 08:00 UTC), 3,110 fills over 4 sessions (pre-market, regular, after-hours, overnight). Per session: fills, on-chain VWAP, base volume, and what is missing.

8/ What is missing is named, not hidden: the closing-price leg is off by design, so every session abstains with no_close_ref; no gap and no closing price are served. Proof of reserves unavailable, no wrapper contract named, quorum sampled at one transaction body in five. Residuals are part of the record.

9/ Check it yourself, from the public mirror at v0.6.0, with Node alone:
node apps/bell/scripts/bell-verify.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json
We ran it after the tag: status consistent_with_supplied_keyring, head_seq 1, zero breaks.

10/ The method (https://monarkgate.tech/bell/method): sessions and regimes are fixed by New York's clock; fills are read from the ledger, once per transaction; the gap, when the close is wired, is ln(P_session / P_close), reported as shares beyond one, two and five percent, per regime. Definitions are pinned to the collector's source by a test.

11/ Who Bell is for, and why. Issuers of tokenized equities and their market makers: a third-party record of how their instrument trades when the primary market is closed, signed, replayable, not theirs. Lenders and curators who accept these instruments as collateral: a named residual when a session cannot be read.

12/ Reconciliation and venue teams: one file per session, one digest per run, a chain that shows any rewrite. Researchers and regulators: the same files, the same verifier, the same key. Nothing is served to one party that is not served to all.

13/ What we add next on Bell: more symbols as their pools are read on their chains (four today: TSLAx, AAPLx, NVDAx, SPYx), the official closing-price source and its licence, then the founding measurement: the share of overnight and weekend sessions beyond one and five percent, with the count behind each share. Issuers are named only by their on-chain facts.

14/ Ukemi: https://monarkgate.tech/ukemi. Ukemi is the attested measure of liquidation exposure on a lending venue: a book read at one declared block, the oracle price path the protocol consulted, and a conformal upper bound on the amount liquidated, per stratum, with residuals. Read-only. Never a probability of being right.

15/ The task in progress: the calibration course on one recorded episode is closed through its offline steps. Stratum 0 holds 170 calibration points; exchangeability with an earlier episode held (361 of 363 within the bound, test at five in a hundred). Strata 1 to 3 are under_calib: too few points, and the page says so.

16/ Within 24 hours: the Chainstack reconciliation step of the course, then the commit of stratum 0 to the served class. From then on the served Ukemi answers on that stratum and abstains on the others. The verdicts are on https://monarkgate.tech/ukemi/course.

17/ Narabi: https://monarkgate.tech/narabi. Narabi is the freshness sensor of the fleet: it reads a served surface, checks its hash chain and its age, and writes the result as a public state. This release keeps its page and its served state; the probe and its deployment attestation are unchanged.

18/ Who Ukemi and Narabi are for. Ukemi: lenders, curators and risk teams who need an attested exposure they can recompute, not a dashboard. Narabi: anyone who serves a public record and wants a third party to say, with a hash, whether it is fresh.

19/ How it is built: gates from plan to verdict, a review by a separate instance with a fresh context, a validator checkpoint, the full test suite as the execution oracle, then a merge. Tonight's final oracle: 1,177 tests, 0 failures. What stays open is a dated item with an owner and a trigger.

20/ Reading rules, printed on every page: facts witnessed, not investment advice · a signature attests origin, not truth · no endorsement of or by any venue, issuer or data source · never a probability of being right.

21/ Next: we are filing our method with the SEC, as a public comment on File No. 4-927 (the Sept. 17 exemptive order on tokenized securities). We will publish the link, and the proof, in the coming hours.

---
Long post (≤ 900 words) and LinkedIn version: to be derived from the same facts on request.
