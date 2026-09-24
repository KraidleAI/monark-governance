# SOURCES — THREAD v0.6.0 (Bell served)

Provenance: worker `claude-opus-5-5[1m]` (effort max), 2026-09-23 22:25–22:55 UTC, decision 156; reviewer: orchestrator (R-21). No write under `F:\Monark*`, no commit, no workflow. GETs only on the URLs listed by the mission. One consultation of the built-in advisor before writing (R-26). Levels: **[lu]** = read first hand in the named file or served URL at the stated time; **[calc]** = recomputed by a script in `proof/` (non-LLM, rerunnable); **[déclaré]** = statement of the orchestrator in CHANTIERS/JOURNAL, not re-measured by me.

## §0 Pre-post checks — BLOCKING (the investor posts only when all pass)

| # | Check | How | Pass condition | State at 22:29Z |
|---|---|---|---|---|
| P-1 | Public repository at v0.6.0 contains the verifier and the keyring | `curl -sI https://raw.githubusercontent.com/KraidleAI/Monark/v0.6.0/apps/bell/scripts/bell-verify.mjs` and `.../apps/bell/keys/bell-keyring.json`; `sha256sum` of the keyring | 200 twice; keyring sha256 = `beec868a9e7d8e396de0f0541ab20572a2159068e8102bb303cb9af368b6ef81` | **FAILS as built**: export whitelist excludes `apps/bell` (§5 C-1). If still failing: use the Alternates of posts 4, 7, 8, of the long post's "How to check a line" and of the LinkedIn post, and drop or move 9–10 |
| P-2 | Site pages show Bell served (lot BELL-SERVED-1 uploaded) | GET `/`, `/bell`, `/bell/method` | no "upcoming" on the Bell card; `/bell` status table reads the served files; `/bell/method` shows the public key (not "to be published") | **FAILS**: at 22:26Z `/` and `/bell` say "upcoming", `/bell` says "Nothing on this page is served as a Bell record today", `/bell/method` says "pubkey_ed25519 to be published" (§5 C-4) |
| P-3 | GitHub release v0.6.0 exists | GET `https://github.com/KraidleAI/Monark/releases` | a `v0.6.0` entry | **FAILS**: at 22:26:28Z only v0.5.0 (pre-release, 20:41:34Z), v0.4.0 (Latest), v0.3.0, v0.1.0 |
| P-4 | v0.6.0 notes corrected | read the published notes | no "during a window when the US market was closed"; no claim of files absent from the public tree | **FAILS** on `F:\tmp\release-151\notes-v0.6.0.md` (§5 C-1, C-2) |
| P-5 | Served files unchanged or only appended | `sha256sum` of `timeline.jsonl` line 1 and `state.json` | line 1 bytes unchanged (`8dfd2b78…` while the timeline has one line); if a line was appended, post 5 still holds (seq 1), recheck post 14 against the head | PASS at 22:25:54Z |
| P-6 | Mechanical checks after any edit | `python proof/check_thread.py` | 0 post over 280, long post ≤ 900 words, LinkedIn ≤ 1 300, 0 vocab hit | PASS at 22:50:54Z (§4) |

## §1 Retrieval log (GET, `curl -s -S -L`, bodies and headers in `proof/fetch/`)

| URL | UTC | HTTP | bytes | sha256 of body |
|---|---|---|---|---|
| https://bell.monarkgate.tech/timeline.jsonl | 22:25:54Z | 200 | 877 | `8dfd2b78c4ba06c61165b13f29929526b50339228a458e0c13a214281211b0ad` |
| https://bell.monarkgate.tech/state.json | 22:25:55Z | 200 | 5 326 | `a828489f64f112c8026b7c38f3710b82af1c97245fdba10b16170e39aed7a240` |
| https://bell.monarkgate.tech/bell/pubkey.json | 22:25:55Z | 200 | 239 | `beec868a9e7d8e396de0f0541ab20572a2159068e8102bb303cb9af368b6ef81` |
| https://monarkgate.tech/ | 22:26:25Z | 200 | 113 708 | `9ebe124542303a643fa538b481a09821fc33041f033a70f92d2d803b1390f21b` |
| https://monarkgate.tech/bell | 22:26:25Z | 200 | 106 999 | `44e6b9de1510fa4715a4df691edd519ca3259218882be877e5c24b4a7313bf7e` |
| https://monarkgate.tech/bell/method | 22:26:26Z | 200 | 80 026 | `229ac1e583d90ea4da3f7108d2d700465bbc157747d5113fb12fb77bc98dc7c2` |
| https://monarkgate.tech/bell/terms | 22:26:27Z | 200 | 41 095 | `c87d369e4002aca06f5605059e3133db45325c30dfc3d0b5190529c34121d957` |
| https://github.com/KraidleAI/Monark/releases | 22:26:28Z | 200 | 275 958 | `b826557c385838307f2e4f1513e4d77a5a4e0836324d3b5856df4e2b0edb3890` |

Concordances [calc]: timeline sha = JOURNAL-PROVENANCE:371 (miroir étape 13) ; state sha = `state_sha256` of the served line = JOURNAL:369 ; pubkey sha = `sha256sum F:\Monark\apps\bell\keys\bell-keyring.json` (commit `41cb08e`) = `docs/deploy-CA-bell.json` `keyring_sha256`. Text extractions of the HTML pages: `proof/fetch/*.txt` (`proof/html2txt.py`).

## §2 Fact trace, post by post (thread numbering; the long post and LinkedIn reuse the same facts)

| Post | Claim or number | Source (file:line or URL @ UTC) | Level |
|---|---|---|---|
| 1 | served since 21:35 UTC | timeline.jsonl `published_at` 2026-09-23T21:35:52.438Z @22:25:54Z; JOURNAL-PROVENANCE:369 | [lu] |
| 1 | "Release v0.6.0 carries it" | `F:\tmp\release-151\notes-v0.6.0.md` l.1; **not yet published** (P-3) | [lu] + P-3 |
| 2 | one design, light/dark, self-hosted fonts, footer rules; core hero "one engine, AI layers and DeFi layers", statuses from the fleet register | `notes-v0.5.0.md` l.7; home page text @22:26:25Z ("One engine. AI layers, DeFi layers." ; "Each status comes from the fleet register" ; footer); CHANTIERS:1289-1296 | [lu] |
| 3 | /bell, /bell/method, /bell/anchors; a test pins bounds and residuals to the collector | test `bell_method_facts_match_collector` = `F:\tmp\release-151\dryrun9.log:1618` ("/bell/method definitions equal apps/bell/src (bounds, calendar, decimals, residuals)"); formulas are NOT claimed pinned: /bell/method @22:26:26Z says the ADV denominator is "in review" and computed "over a different window" | [lu] |
| 3 | 17 anchor lines, 15 of 16 proofs with a Bitcoin block record, read from the files | /bell/method @22:26:26Z: "lines in the register 17 (16 with a proof, 1 without)", "proofs with a Bitcoin record 15 of 16, read from the proof files"; CHANTIERS:1239 | [lu] |
| 3 | terms and privacy online | /bell/terms 200 @22:26:27Z; /bell/privacy 200 per CHANTIERS:1295 (19:52 upload, 17/17 paths) — /bell/privacy not fetched (outside the GET list) | [lu] + [déclaré] |
| 4 | plain files, append-only, each line carries previous hash + Ed25519 signature | served line fields `prev_line_hash`, `sig`, `schema bell-timeline-v1` @22:25:54Z; `apps/bell/scripts/bell-chain.mjs:67` (signingBytes), `:125` (walkTimeline chain rule) | [lu] |
| 4 | key committed as trust root | commit `41cb08e` (`apps/bell/keys/bell-keyring.json`, sha `beec868a…` = served pubkey); `bell-verify.mjs:1-9` (trust root = supplied keyring). **Public mirror: P-1** | [lu] + P-1 |
| 5 | seq 1, 21:35:52 UTC, key_id `30fd26e8…`, key_id = SHA-256 of the key bytes, prev_line_hash 64 zeros | served line @22:25:54Z; `proof/indep-verify.out.txt` (`key_id_matches_sha256_of_x true`, `prev_line_hash_is_genesis true`); `bell-chain.mjs:86` | [lu] [calc] |
| 6 | 12-check attestation at 21:36 UTC, 12/12, the 12 names | `F:\Monark\docs\deploy-CA-bell.json` (`checked_at` 2026-09-23T21:36:12.733Z, checks c01..c12 all `ok:true`, sha256 `8c2031404c41ebf4…`, commit `7a39698`); names `scripts/verify-bell.mjs` CHECK_NAMES; run from the orchestrator's machine against the host (header l.3) | [lu] (private repo) |
| 7 | v0.5.0 pre-release 20:41 UTC; contents | releases page @22:26:28Z (`datetime="2026-09-23T20:41:34Z"`, "Pre-release", commit `ea29fbd`); body = notes-v0.5.0 | [lu] |
| 7 | v0.6.0 adds host, publisher, verifier, host config | notes-v0.6.0 l.11-15 "What changed in the code" | [lu] + P-1/P-3 |
| 8 | command, paths, "with Node alone" | `bell-verify.mjs:119-133` (CLI `--url`/`--dir`, `--keyring`), header l.9 "Node built-ins (global fetch) + bell-chain.mjs only"; `scripts/verify-bell.mjs:5` (same invocation) | [lu] + P-1 |
| 9 | what the verifier checks; one JSON line; exit 1 with named reason | `bell-verify.mjs:84-116` (walk, signatures, key schedule, `state_not_bound_by_head`, immutables, `bell_sha_mismatch`), `:119-133` (exit codes), `:15-18` (closed refusal list) | [lu] |
| 10 | meaning of `consistent_with_supplied_keyring` / `self_consistent_only`; served key outside keyring refused | `bell-verify.mjs:6`, `:85`, `:94-99` (`served_key_not_in_keyring`), `:114` | [lu] |
| 11 | partial check from the three files: Ed25519 over canonical JSON without `sig`; sha256(state.json) = state_sha256 | `bell-chain.mjs:14-22` (canonical), `:67-72` (signing bytes), `:76-83` (verifyLine); **proven** by `proof/indep-verify.mjs` @22:30:31Z and 22:45:57Z: `sig_valid_ed25519 true`, `sig_on_tampered_copy false` (negative control), `state_sha256_bound true`, `bell_sha_recomputed true`, `line_hash 4a417cf0…` = JOURNAL:369 | [calc] |
| 12 | signature = origin, not truth; recompute from public inputs | /bell @22:26:25Z conditions ("The signature proves who published the record and when. It does not prove…"); `bell-verify.mjs:7` | [lu] |
| 13 | four tokens, AMM pools on Solana; per session fills, volume vs ADV, gap to last close | /bell @22:26:25Z "Population", "Fact one", "Fact two" | [lu] |
| 14 | TSLAx, window 2026-09-16 04:00 ET → 2026-09-17 03:59:59 ET; 4 sessions; 3 110 fills | served line `window` 1789545600000→1789631999000 = 08:00:00Z→07:59:59Z [calc, `proof/indep-verify.out.txt` `window_utc`]; EDT = UTC−4; `records[0].sessions 4`, `n_fills 3110`; state gaps sessions pre/regular/after/overnight-weekday, Σn = 3 110 [calc] | [lu] [calc] |
| 15 | signature set concorded on 2 distinct operators (the site's word; "independent" not claimed); ~1 body in 5 re-read on both; quorum_coverage 0.2; residual quorum_sampled | `apps/bell/src/collect.ts:352-404` (quorum2 on the windowed signature set; body sampled every N; `coverage = sampled / inWin.length`; `quorum_sampled` if sampled < inWin); served `quorum_coverage 0.20006412311638347` = 624/3 119 (3 119 bodies: CHANTIERS:1244) | [lu] [calc] |
| 16 | no close, no gap; 4 × no_close_ref; por_unavailable, no_wrapper | state.json @22:25:55Z `residuals` {no_close_ref 4, no_wrapper 1, por_unavailable 1, quorum_sampled 1}; 4 gaps `abstain: no_close_ref`; definitions /bell/method residuals list | [lu] |
| 17 | why: official close source + licence allowing a derived value; not wired | ADR-B0:315 ("aucune valeur de marché n'est servie (jambe cash coupée, `no_close_ref`)", item CLOSE-SOURCE-NAMING-1); CHANTIERS:1343 (22:28Z, research: derived value from the close is the licence question; consultation formed); /bell "Closing prices … never republished" | [lu] |
| 18 | Ukemi card wording; one recorded episode 22 Sep 2025; offline steps closed (book, oracle path, calibration, hypothesis report) | home page card @22:26:25Z ("Attested measure of liquidation exposure on a lending venue"); Sidecar `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:40` (Sidecar 6: 6a-6d exit 0, `hyp-report-weth-2025-09-22.json`); CHANTIERS:1262-1266 ("étapes 1-6 closes, reste étape 7") | [lu] |
| 19 | H-3 s0 yes 361/363 (pre-registered beta-binomial test at 5 in 100; the thread says "test", not "exact test", because prereg:100 states exactness fails under the one-sided residual, atoms at 0); s1-s3 under_calib; H-6 yes, max lag 2, bound 3 | Sidecar :40 (`H-3 : s0 OUI (k 361, n_e2 363, p-value ≈ 0,4634)`, `s1, s2, s3 UNDER_CALIB`, `H-6 : OUI, retard max 2 events (borne 3)`); definitions `docs/PLAN-u4b-prereg.md:100,103` | [lu] |
| 20 | H-4 cell A 2/47 yes, all liquidated 4/72 no (expected by prereg); reporting thresholds; 1 of 4 strata committable | Sidecar :40 (`H-4 : cellule A 2/47 … (OUI vs 5/100) ; tous liquidés 4/72 … (NON, attendu prereg :101)`, `registre : 1/4 strates committables`); `PLAN-u4b-prereg.md:101,106` ("seuils de RAPPORT … Rien de servi ne dépend de ces trois constantes") | [lu] |
| 21 | write-ahead ledger line before the call; crash over-counts; fsync; 2 operators; exclusion by name, never below two | `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md:34` (write-ahead, "un crash sur-compte, jamais ne sous-compte"); `packages/rpc-guard/src/ledger.ts:55-58` (open → write → fsync → close); `scripts/census/u4-oracle-path.mjs:186-203` (`--exclude-operator`, label guard, quorum guard ≥ 2 distinct operators); CHANTIERS:1187 (cp-2 final CA-11: ledger wired to sentinel, Ukemi recorder, Bell collector) | [lu] |
| 22 | G0–G7 chain for product code; site copy lighter path | T-1b chain JOURNAL:362 (G2, G2-delta, cp-2 per PR, oracle); cp-1 CHANTIERS:1164; decision 146 procedure for site copy CHANTIERS:1130 | [lu] [déclaré] |
| 23 | 3 PRs merged in order; final oracle 1 170 tests, 0 failures; open points = dated items; mirror CI reruns gates on each push | JOURNAL:362 ("1 170 / 1 168 / 0 / 2"), CHANTIERS:1337 (order PR-1 → PR-2 → PR-3, R-25); CHANTIERS:1310-1312 (mirror `gates` workflow, 2 × success on `ea29fbd`) | [lu] [déclaré] |
| 24 | founding measurement = share of weekday-overnight / weekend sessions beyond one and five percent, with counts; SPYx resumes where paused | /bell @22:26:25Z ("first measurement … beyond one percent … beyond five percent … sessions with g computed"); CHANTIERS:1222-1223 (SPYx stopped 16:41:33Z, 15 036 pages, resume from last complete page, item SPYX-RESUME-1) | [lu] |
| 25 | SEC File No. 4-927, Release 34-106402, issued Sept. 17, 2026 | `docs/sec-4927/FAITS-sec-gov-4-927-lecture-sur-place-2026-09-23.md:6` | [lu] (orchestrator's on-site reading) |
| 25 | rotation within 90 days (trigger 2026-12-22) or at once on exposure; cross-signed | `docs/RUNBOOK-bell.md:57-65`, `:316-325`; `bell-chain.mjs:125` walkTimeline (rotation signed by the active key + `sig_new` under the new key) | [lu] |
| 26 | reading rules verbatim | footer of every fetched page @22:26Z: "facts witnessed, not investment advice", "a signature attests origin, not truth", "no endorsement of or by any venue, issuer or data source", "never a probability of being right" | [lu] |
| 27 | links | §1 (all 200 except the GitHub path casing, served as `KraidleAI/monark` in the site footer; GitHub resolves either) | [lu] |

## §3 Independent check (non-LLM oracle, rerunnable)

`node F:\tmp\thread-v060\proof\indep-verify.mjs F:\tmp\thread-v060\proof\fetch` — Node built-ins only, no import from the repository; own canonical JSON (keys sorted, no whitespace). Output (`proof/indep-verify.out.txt`, 22:45:57Z, exit 0): `sig_valid_ed25519 true` · `sig_on_tampered_copy false` · `key_id_matches_sha256_of_x true` · `prev_line_hash_is_genesis true seq 1` · `state_sha256_bound true` · `bell_sha_recomputed true` · `line_hash 4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c` · `sum_gap_n 3110 gaps 4` all `no_close_ref` · `window_utc 2026-09-16T08:00:00.000Z 2026-09-17T07:59:59.000Z`. Not run: the repository verifier with `--url` (it also fetches `provenance.json`, `states/…`, `provenance/…`, outside the mission's GET list).

## §4 Mechanical checks (`python F:\tmp\thread-v060\proof\check_thread.py`, 22:50:54Z, output `proof/check_thread.out.txt`)

- 27 posts, numbering 1/27…27/27 contiguous; longest 278 code points (posts 3, 20); 0 over 280; alternates 264 / 209 / 236.
- Long post 899 words (≤ 900). LinkedIn 1 293 characters; LinkedIn with the P-1 alternates 1 285.
- Vocabulary sweep on the postable text (posts, alternates, long post, LinkedIn), mask = the verbatim negation "never a probability of being right" only: `vocab-banned.json` global + scopes `site`, `bell`, `skills`, plus the mission list and neighbours (score, accuracy, guarantee, probability, Massive, Databento, RPC operator and close-source vendor names, venue names, Aave, cascade, verified, partner, live, Kraidle, tokenomics, ticker, compliant, certif…, confidence, autonomous, predicts, proven): **0 hit**. Numeric percentages: none (thresholds written in words, as on /bell).

## §5 Constats for the orchestrator (R-21) — each carries its evidence

- **C-1 (blocking: posts 4/7/8, LinkedIn §2/§4, and notes v0.6.0).** The public export does not include Bell. `scripts/export-public.mjs:45` `APP_PACKAGE_DIRS = ["apps/harness", "apps/sentinel"]` (same on `main` `272b8a6`); `WHITELIST_FILES` (`:55-94`) has no `scripts/verify-bell.mjs`; `docs/` is not exported (`STRUCTURAL_BLACKLIST` `:106`). Release dry-run 9 (`F:\tmp\release-151\dryrun9.log:2107-2137`, `:2516-2523`, exit 0 at 21:55:16Z): 401 files, "Changes to publish" = `EXPORT-MANIFEST.json`, `globals.css`, `noyau-engine.ts`, `vocab-banned.json` only. CHANTIERS:1318 already notes "`apps/bell` ne sont pas exportés". Yet notes-v0.6.0 l.7 and l.9 say the key is "committed in this repository" and "a verifier script in this repository … Its result … committed as a JSON file". Options: (a) export `apps/bell` package-style + `scripts/verify-bell.mjs` + a public copy of the CA JSON (ADR-M004 D7 line; tests `product_boundary_matches_export_list`, `derived_workflow_run_paths_are_exported`, test 42), or (b) correct the notes and use the Alternates.
- **C-2 (blocking: notes v0.6.0).** notes-v0.6.0 l.8 "read on a public ledger during a window when the US market was closed" is false: the served window is one full ET trading day and includes the `regular` session (2 422 of 3 110 fills, 13:30:01Z→19:59:45Z) — state.json @22:25:55Z.
- **C-3 (documentation).** JOURNAL-PROVENANCE:366 labels the window "2026-09-16 04:00Z → 2026-09-17 03:59:59Z"; served ms are 08:00:00Z → 07:59:59Z (04:00 ET). CHANTIERS:1244 says the W3 window is "00:00 → 23:59:59 ET"; served = 04:00 ET → 03:59:59 ET.
- **C-4 (blocking: P-2).** At 22:26Z the site still describes Bell as upcoming (/ card "to come", "Every product is upcoming"; /bell status table "upcoming"; /bell/method public key "to be published", ADV denominator "in review" while state.json already carries `adv_period` and the formula).
- **C-5 (to confirm by one GET).** The served `provenance.json` very probably names the cash-data vendor: the published bundle copy `F:\tmp\bell-dn\bundle-1\TSLAx-W3\provenance.json` (sha `a8ba47db…` = JOURNAL:366 "après") has `providers.faults[0].provider = "databento"` and `providers.providers = ["helius","chainstack"]`, and the publisher projection serves `providers.faults[].provider` (`apps/bell/scripts/bell-publish.mjs:56-59`). /bell/terms (22:26:27Z) says "any specific data provider's name … is not published (decision 69)". Not observed on the host by me (outside the GET list).
- **C-6.** /bell says "Bell will publish gaps and ratios, not prices", but state.json serves per-session `vwap` and `volumeBase` and four `vol_ratio` whose denominator is consolidated ADV read from a vendor (CHANTIERS:1230 "entrées ADV … sous `bell-b3b-raws`"; ADR-B0:106 item (a) licence opinion). The thread quotes none of these values.
- **C-7 (published release text).** v0.5.0 notes contradict themselves ("Bell terms of use and privacy notice … served" vs "Terms and privacy pages are not served yet") and use the word "scores".
- **C-8 (mission wording not reproduced).** "tout public dans le miroir": ADRs, G1/G2/G7 files and checkpoints are blacklisted from the export (`export-public.mjs:106-…`); "every change passes G0–G7" is false for site copy (decision 146). Posts 22–23 state only what holds.
- **C-10 (non-blocking, wording).** The served state.json (22:25:55Z) `digest.por[0]` carries third-party names in `method` (an attestation firm) and `note` (an oracle data stream). Not cash data (decision 69 targets close/ADV sources), but a page/wording item next to C-6. The thread does not repeat them.
- **C-9 (mission wording not reproduced).** "course de calibration close": Ukemi is closed through steps 1–6; step 7 (reconciliation) remains (CHANTIERS:1262). Posts 18/20 say so.

## §6 Items formed (zero debt; owner = orchestrator; none is a procurement: no document is missing)

| Item | Kind | Trigger | Options and evidence |
|---|---|---|---|
| THREAD-P1-EXPORT (C-1) | blocking choice | before pushing tag v0.6.0 | (a) export Bell per ADR-M004 D7 + tests named in C-1; (b) Alternates + corrected notes |
| NOTES-V060-WINDOW (C-2) | blocking correction | before publishing v0.6.0 | replace by "one New York trading day, 16 Sep 2026, 04:00 ET to 04:00 ET" |
| THREAD-P2-SITE (C-4) | blocking dependency | before posting | upload BELL-SERVED-1; recheck P-2 |
| JOURNAL-WINDOW-LABEL (C-3) | documentation | next JOURNAL/CHANTIERS write | erratum with the served ms |
| PROVENANCE-VENDOR-LABEL (C-5) | decision 69 scope | before the next publication (same trigger as FAULTS-PROVIDER-NAME-1 (b)) | GET `/provenance.json`; if confirmed, rule whether fault labels may name a cash vendor |
| BELL-PAGE-PRICES (C-6) | page accuracy + licence | with BELL-SERVED-1 page text | align /bell wording with the served `vwap`/`vol_ratio`; confirm the ADV source licence for a published ratio |
| NOTES-V050-CONTRADICTION (C-7) | release text | at the v0.6.0 edit | edit the v0.5.0 release body |

Note: this file names vendors and operators as evidence; it is not postable text.

## §7 Hashes

`sha256sum` of `THREAD.md` and of the files in `proof/` are in `SHA256SUMS` (same folder). The hash of this file is given in the worker's final report (a file cannot carry its own hash).
