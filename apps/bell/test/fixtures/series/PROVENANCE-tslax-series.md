# PROVENANCE — MONARK Bell reduced real-session series (ADR-T1aii lot -a, ADR-M003 D9 sexies)

Traceable origin + file pins for the reduced REAL captures under `apps/bell/test/fixtures/series/`. These
are the offline oracle for the collector replay (`bell_collector_replays_fixture_bit_identical`) and the
Token-2022 read of fact (iv). They are a reduced subset of a real capture; the FOUNDING jul-oct 2025
quorum measurement is lot -b (Helius course), not this. This directory is the R-25 series-excluded root
`apps/bell/test/fixtures/series` (3 `:(exclude,glob)` pathspecs in `.github/workflows/ci.yml`).

- **Chain / source**: Solana mainnet, public archival endpoint `api.mainnet-beta.solana.com`. In every
  Bell artifact and error the endpoint is named by `providerOf` = `solana.com` only — the raw URL is never
  written (C-10). This capture is single-provider (recent bodies), so a quorum re-read of it is not implied;
  the collector's quorum policy (Helius + `solana.com`) is exercised by the injected-call tests.
- **Captured**: 2026-09-19 (a Saturday — a real weekend-regime session, anchored on the prior trading day).
- **Method**: `getSignaturesForAddress` on the TSLAx/USDC Raydium CLMM base vault
  `CYfaMvz6ft1YahGnetsGP3E8GWkURdJcDSzfihGrH8Qo`, then `getTransaction` (jsonParsed) per signature; each
  fill is the SIGNED post-minus-pre delta of the two declared vaults (the same first-hand extraction as
  `rpc.ts` `extractPoolSwap`). The mint capture is `getAccountInfo` (jsonParsed) of the TSLAx mint
  `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` (Token-2022; slot pinned in the file).
- **Reviewer**: independently recomputed before commit (the LF sha below is recomputed by the root test
  `series_pinned_are_declared_and_hashed` on every run).
- **Honesty (D5)**: the series carries NO close-like field and NO ADV — only first-hand on-chain data
  (signatures, blockTime, vault deltas; and the mint's supply / extensions). The reference close is read
  live and never committed (ESC-1 c); the ADV denominator of fact (iii) is never committed (C-6).

## File pins (plain sha256 of the file bytes, LF-normalized — ADR-M003 D9 sexies a)

| file | sha256 (LF) |
|---|---|
| `tslax-weekend-fills.jsonl` | `7f81f670ffd2eb06633b75b962f18f1c3671e7f561e0c1dcf583473ead17513b` |
| `tslax-mint-token2022.json` | `230972b98ef43a2e2eb90b1fd93827036e6a044b7a725743ec094610c066d613` |
