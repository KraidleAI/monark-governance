# THREAD — MONARK v0.6.0: Bell served (EN)

Provenance: drafted by worker `claude-opus-5-5[1m]` (effort max) on 2026-09-23, 22:25–22:50 UTC, for investor decision 156; read-only base `F:\Monark` `lot/etude-suite` at `cab9a29` then `fdc1921`; served pages and files read by GET between 22:25:54Z and 22:26:28Z; reviewer: orchestrator (R-21, adversarial check before any use). Posted by the investor himself. Every number is traced in `SOURCES.md` (same folder).

**Do not post before the blocking pre-post checks of `SOURCES.md` §0 pass.** Posts 4, 7 and 8, the first two paragraphs of the long post's "How to check a line", and two phrases of the LinkedIn post assume the public repository at v0.6.0 contains the Bell verifier and the committed keyring; at 22:29Z the export whitelist did not include them (`SOURCES.md` §5, C-1). Replacement wording, if that check fails, is under "Alternates".

## X thread (27 posts)

### 1/27
```text
1/27 MONARK Bell is served. Since 21:35 UTC tonight a dedicated host publishes a signed, hash-chained record of how a token that tracks a U.S. equity trades on a public ledger. Release v0.6.0 carries it. What is online, how to check it, what is not served yet, what comes next:
```

### 2/27
```text
2/27 Online tonight, the site: one design on every page (light and dark, self-hosted fonts, the reading rules in the footer). The home page shows the MONARK core: one engine, AI layers and DeFi layers, each agent with the status it holds in the fleet register.
```

### 3/27
```text
3/27 Bell's pages: /bell (what it measures), /bell/method (sessions, formulas, residuals; a test pins bounds and residuals to the collector), /bell/anchors (17 anchor lines of the first run; 15 of 16 proofs carry a Bitcoin block record, read from files), plus terms and privacy.
```

### 4/27
```text
4/27 The Bell host serves plain files: state.json, timeline.jsonl (append-only; each line carries the hash of the previous one and an Ed25519 signature) and bell/pubkey.json. The same public key is committed to the repository as the trust root.
```

### 5/27
```text
5/27 First publication: seq 1, 2026-09-23 21:35:52 UTC, signed by key_id 30fd26e8…, the SHA-256 of the public key's bytes. Its prev_line_hash is 64 zeros: it is the first line. Every later line must carry the hash of the line before it.
```

### 6/27
```text
6/27 At 21:36 UTC a 12-check deployment attestation ran against the host: schema, chain and signatures under the committed key, served key = committed key, headers, no listing, cache rules, TLS, no private material, config equal to the released bytes, probe untouched. 12/12.
```

### 7/27
```text
7/27 Releases: v0.5.0 went out as a pre-release at 20:41 UTC (site, Bell pages, legal pages, the budget guard). v0.6.0 adds the Bell host, the publisher, the verifier and the host configuration.
```

### 8/27
```text
8/27 Check the record yourself, from a clone of the repository at v0.6.0, with Node alone:

node apps/bell/scripts/bell-verify.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json
```

### 9/27
```text
9/27 It fetches the served files, walks the chain, checks every signature and the key schedule, ties state.json to the head line by SHA-256, recomputes each run's digest and prints one JSON line. Any failure exits 1 with a named reason.
```

### 10/27
```text
10/27 "status":"consistent_with_supplied_keyring" means every check passed with the keyring you supplied as the only trust root; a served key missing from it is refused. Drop --keyring and you get self_consistent_only: the host agrees with itself, nothing more.
```

### 11/27
```text
11/27 No clone? The three served files allow a partial check: the signature is Ed25519 over the line's canonical JSON (keys sorted, no whitespace, sig removed), and sha256(state.json) must equal the line's state_sha256. The key then comes from the host itself.
```

### 12/27
```text
12/27 What a valid signature tells you: who published these bytes, and that they have not changed since. It does not tell you the fact is right. That is checked by recomputing it from the public inputs.
```

### 13/27
```text
13/27 What Bell measures: four tokens that track U.S. equities (TSLAx, AAPLx, NVDAx, SPYx) on public AMM pools on Solana. Per session: the fills read from the chain, their volume against the underlying's average daily volume, and the gap to the last close.
```

### 14/27
```text
14/27 The first record: TSLAx over one New York trading day, 16 Sep 2026, from 04:00 ET to 04:00 ET the next day. 4 sessions (pre-market, regular, after-hours, overnight), 3,110 fills.
```

### 15/27
```text
15/27 How it was read: the set of transactions in the window had to match on two distinct operators; about one transaction body in five was also read on both and had to agree (quorum_coverage 0.2). The record names that sampling as a residual: quorum_sampled.
```

### 16/27
```text
16/27 What is not served: no closing price and no gap. All 4 sessions abstain with no_close_ref, by design. The record also names what it could not establish: proof of reserves unavailable, no wrapper or bridge contract named (por_unavailable, no_wrapper).
```

### 17/27
```text
17/27 Why: a gap is measured against the underlying's closing price. That price has to come from a source we can name as official, under a licence that allows publishing a value derived from it. Neither is wired yet, so the cash leg stays off.
```

### 18/27
```text
18/27 Ukemi, the attested measure of liquidation exposure on a lending venue: its calibration course on one recorded episode (22 Sep 2025) is closed through its offline steps (book at a block, realized oracle path, calibration, hypothesis report), computed from recorded reads.
```

### 19/27
```text
19/27 Pre-registered hypotheses, as reported. H-3, exchangeability with an earlier episode (test at 5 in 100): stratum 0 yes, 361 of 363 within the fresh bound; strata 1-3 too few to calibrate. H-6, served oracle value in the on-chain series: yes, lag at most 2 (bound 3).
```

### 20/27
```text
20/27 H-4, positions liquidated by more than one call (line at 5 in 100): 2 of 47 in cell A, yes; 4 of 72 across all liquidated, no, as pre-registered. Reporting thresholds only; nothing served depends on them. 1 of 4 strata can be committed. Never a probability of being right.
```

### 21/27
```text
21/27 The budget guard behind every paid read: a hash-chained ledger line is written and fsync'd before the call leaves, so a crash can over-count, never under-count. Reads need two distinct operators to agree; a deviant operator can be excluded by name, never below two.
```

### 22/27
```text
22/27 How it is built: product code passes gates G0 to G7, a plan approved before code, a review by a separate instance with a fresh context, a validator checkpoint, the full test suite as an execution oracle, then a verdict. Site copy takes a lighter path of technical checks.
```

### 23/27
```text
23/27 Tonight's Bell backend: 3 pull requests, each reviewed and checkpointed, merged in order; the final oracle ran 1,170 tests, 0 failures. What stays open becomes a dated item with a trigger. The public mirror carries the exported code and tests; each push reruns the gates.
```

### 24/27
```text
24/27 Next: an official closing-price source and its licence. Then the founding measurement: the share of TSLAx's weekday-overnight and weekend sessions with a gap beyond one percent and five percent, and the count behind each share. SPYx's enumeration resumes where it paused.
```

### 25/27
```text
25/27 Also next: a public comment letter on SEC File No. 4-927 (Release 34-106402, the Sept. 17 exemptive order), built around the method. And the first key rotation: within 90 days (by 22 Dec 2026), or at once on any exposure, signed by both the old and the new key.
```

### 26/27
```text
26/27 Reading rules, printed on every page: facts witnessed, not investment advice · a signature attests origin, not truth · no endorsement of or by any venue, issuer or data source · never a probability of being right.
```

### 27/27
```text
27/27 Links. Signed timeline: bell.monarkgate.tech/timeline.jsonl · State: bell.monarkgate.tech/state.json · Key: bell.monarkgate.tech/bell/pubkey.json · Method: monarkgate.tech/bell/method · Code: github.com/KraidleAI/Monark
```

### Alternates (use ONLY if pre-post check P-1 fails: the public repository at v0.6.0 does not contain the Bell verifier and keyring)

```text
4/27 The Bell host serves plain files: state.json, timeline.jsonl (append-only; each line carries the hash of the previous one and an Ed25519 signature) and bell/pubkey.json. The key is also committed as the trust root; our public export does not include Bell yet.
```

```text
7/27 Releases: v0.5.0 went out as a pre-release at 20:41 UTC (site, Bell pages, legal pages, the budget guard). v0.6.0 marks the Bell host going public; the Bell code joins the public export in a later update.
```

```text
8/27 The verifier (apps/bell/scripts/bell-verify.mjs, --keyring apps/bell/keys/bell-keyring.json) is not in the public export yet. Until it is, anyone can run the partial check below with the three served files and Node's crypto module.
```

(With the alternates, 9/27 and 10/27 still describe the tool truthfully but a reader cannot run it: move them after the export lands, or drop them and renumber to 25 posts.)

Long post, if P-1 fails: in *How to check a line*, drop the sentence "From a clone of the repository at v0.6.0, with Node alone:", the command line, and the three sentences that follow it (from "It walks the chain" to "nothing more."); replace "Without a clone, the served files allow a partial check:" with "The verifier is not in the public export yet; until it is, the served files allow a partial check:" and keep the rest as written. In the *Online tonight* paragraph, "v0.6.0 adds the Bell host, the publisher, the verifier and the host configuration" becomes "v0.6.0 marks the Bell host going public".

## Long post (≤ 900 words)

**MONARK v0.6.0: Bell is served**

Since 21:35 UTC on 23 September 2026, a dedicated host publishes MONARK Bell's first signed record.

*Online tonight.* The site uses one design on every page, with the reading rules in the footer. The home page shows the MONARK core: one engine, AI layers and DeFi layers, each agent with its status from the fleet register. Bell has three pages: /bell, /bell/method (sessions, formulas and residuals; a test pins the bounds and residuals to the collector's source) and /bell/anchors (17 anchor lines of the first run; 15 of 16 proofs carry a Bitcoin block record, read from the proof files), plus terms of use and a privacy notice.

The Bell host serves plain files: state.json, timeline.jsonl and bell/pubkey.json. The timeline is append-only; each line carries the hash of the previous one and an Ed25519 signature. The first publication is seq 1, at 21:35:52 UTC, signed by key_id 30fd26e8…, the SHA-256 of the public key's bytes; its prev_line_hash is 64 zeros. At 21:36 UTC a 12-check deployment attestation ran against the host: 12 of 12. v0.5.0 went out as a pre-release at 20:41 UTC; v0.6.0 adds the Bell host, the publisher, the verifier and the host configuration.

*How to check a line.* From a clone of the repository at v0.6.0, with Node alone:

`node apps/bell/scripts/bell-verify.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json`

It walks the chain, checks every signature and the key schedule, ties state.json to the head line by SHA-256 and recomputes each run's digest. "consistent_with_supplied_keyring" means every check passed with the keyring you supplied as the only trust root; a served key missing from it is refused. Without --keyring the answer is "self_consistent_only": the host agrees with itself, nothing more. Without a clone, the served files allow a partial check: the signature is Ed25519 over the line's canonical JSON (keys sorted, no whitespace, sig removed), and sha256(state.json) must equal the line's state_sha256. A valid signature attests who published the bytes, not that the fact is right; recomputing it from the public inputs checks that.

*What Bell measures.* Four tokens that track U.S. equities (TSLAx, AAPLx, NVDAx, SPYx) on public AMM pools on Solana. Per session: the fills read from the chain, their volume against the underlying's average daily volume, and the gap to the last close. The first record covers TSLAx over one New York trading day, 16 September 2026, from 04:00 ET to 04:00 ET the next day: 4 sessions (pre-market, regular, after-hours, overnight) and 3,110 fills. The transaction set had to match on two distinct operators; about one transaction body in five was also read on both (quorum_coverage 0.2, named as the residual quorum_sampled). No closing price and no gap are served: all 4 sessions abstain with no_close_ref, by design. A gap needs the underlying's closing price from a source we can name as official, under a licence that allows publishing a value derived from it; neither is wired yet, so the cash leg stays off.

*Ukemi.* The calibration course of Ukemi, the attested measure of liquidation exposure on a lending venue, is closed through its offline steps on one recorded episode (22 September 2025): book at a block, realized oracle path, calibration and hypothesis report, computed from recorded reads. As reported: H-3 (exchangeability with an earlier episode, test at the 5 in 100 level) yes in stratum 0, 361 of 363 within the fresh bound, strata 1 to 3 too few to calibrate; H-6 (served oracle value in the on-chain series) yes, lag at most 2 updates (bound 3); H-4 (positions liquidated by more than one call, line at 5 in 100) yes in cell A, 2 of 47, and no across all liquidated positions, 4 of 72, as pre-registered. These are reporting thresholds; nothing served depends on them. One stratum of four can be committed; reconciling the run's paid reads is the step left. Never a probability of being right.

*The budget guard.* Behind every paid read, a hash-chained ledger line is written and fsync'd before the call leaves, so a crash can over-count, never under-count. Reads need two distinct operators to agree; a deviant operator can be excluded by name, never below two.

*The method.* Product code passes gates G0 to G7: a plan approved before code, a review by a separate instance with a fresh context, a validator checkpoint, the full test suite as an execution oracle, then a verdict; site copy takes a lighter path of technical checks. What stays open becomes a dated item with a trigger. Tonight's Bell backend came in three pull requests, each reviewed and checkpointed, merged in order; the final oracle ran 1,170 tests, 0 failures. The public mirror carries the exported code and tests, and each push reruns the gates.

*Next.* An official closing-price source and its licence; the founding measurement, the share of TSLAx's weekday-overnight and weekend sessions with a gap beyond one percent and five percent, with the count behind each share; a public comment letter on SEC File No. 4-927 (Release 34-106402, the Sept. 17 exemptive order), built around the method; the first key rotation, within 90 days (by 22 December 2026) or at once on any exposure, signed by both the old and the new key.

Reading rules: facts witnessed, not investment advice · a signature attests origin, not truth · no endorsement of or by any venue, issuer or data source · never a probability of being right.

## LinkedIn post (≤ 1,300 characters)

```text
MONARK v0.6.0: Bell is served.

Since 21:35 UTC on 23 Sep 2026, a dedicated host publishes a signed, hash-chained record of how a token that tracks a U.S. equity trades on a public ledger. First line: seq 1, Ed25519-signed, key committed as the trust root. A 12-check deployment attestation: 12/12.

The first record covers TSLAx over one New York trading day: 4 sessions, 3,110 fills, the transaction set matched on two distinct operators. No closing price and no gap are served yet: every session abstains with a named reason (no_close_ref) until an official close source and its licence are wired.

Anyone can check the record: the repository ships a verifier that walks the chain, checks each signature against the committed keyring and ties the state file to the signed line by SHA-256.

Also tonight: one site design, Bell's method and anchor pages, terms of use, and Ukemi's calibration course closed through its offline steps, pre-registered hypotheses reported as measured.

Next: the close source, the founding measurement, a comment letter on SEC File No. 4-927, the first key rotation.

Facts witnessed, not investment advice. A signature attests origin, not truth. No endorsement of or by any venue, issuer or data source. Never a probability of being right.

monarkgate.tech/bell
```

LinkedIn, alternate paragraph 2 and 4 (use ONLY if P-1 fails):

```text
Since 21:35 UTC on 23 Sep 2026, a dedicated host publishes a signed, hash-chained record of how a token that tracks a U.S. equity trades on a public ledger. First line: seq 1, Ed25519-signed, public key served beside it. A 12-check deployment attestation: 12/12.

Anyone can check the signature and the state binding with the three served files: Ed25519 over the line's canonical JSON, and the state file's SHA-256 equal to the one the line carries.
```
