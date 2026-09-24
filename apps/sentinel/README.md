# @monark/sentinel

An **off-tool daily job** (ADR-M012) that senses redemption-run velocity on the attested onchain USDe
flow and publishes a replayable daily timeline. It runs beside the MONARK harness, never inside it: the
harness never imports this package, and this package never imports the harness tools. Node built-ins
only, no persistence beyond the files it publishes.

## What it does

Once a day the job processes every **complete, finalized** UTC day, from the resume point up to the
latest day whose closing midnight is finalized, in order. For each day it:

- reads the window's onchain facts (burns, mints, and supply at the open and close block) from a quorum
  of Ethereum RPC endpoints, at block finality;
- folds them through the quantile tracker (ADR-M009), which steps a running estimate of the
  redemption-flow quantile one day at a time;
- appends one line to a timeline and refreshes a small state summary.

A day whose closing midnight is not yet finalized is **lag**, never a skipped step; a consistency check
(C1) or a quorum disagreement stops the run fail-closed (the window is not written) and is reported as
lag, so the next slot retries. Nothing is written under `--dry-run`.

## Served surface

The job writes `timeline.jsonl` and `state.json` and copies them under `public/` for the web tier to
serve at `/narabi/`. The storefront's `/narabi` board reads those published bytes directly, and the
`narabi_live_parses_real_state_shape` integration test replays that composition byte-for-byte (published
snapshot to the site parser). It publishes a timeline and a running statistic only — no price, no
counterfactual, no early-warning reading (ADR-M012 D8).

## Run it

    node apps/sentinel/src/run.ts --dry-run            # inspect the due days, write nothing
    node apps/sentinel/src/run.ts --day 2026-09-19     # run a single day diagnostically
    MONARK_SENTINEL_DIR=/var/lib/monark-sentinel \
      node apps/sentinel/src/run.ts                    # the daily catch-up run

The first run needs `MONARK_SENTINEL_J0` (the first published day); afterwards the job resumes from the
last recorded day. The state directory holds the private timeline and the `public/` copies the web tier
serves.

## Reproduce

The windowing is recomputed against a sha-pinned committed series through a stubbed RPC (offline), so a
day's facts can be rebuilt without a live node — `sentinel_windows_identical_to_pull` replays it. Every
committed series carries a same-directory `PROVENANCE-*.md` stating how it was acquired and its hash.
