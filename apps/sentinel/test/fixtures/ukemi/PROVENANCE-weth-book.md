# PROVENANCE — `weth-book.fixture.json` (Ukemi lot U-1a, ADR-U1 D5/D9 — reduced REAL liquidation-book fixture)

Traceable origin of the sha-pinned data series under this directory (ADR-M003 D9 sexies: declared + hashed
same-dir, one file per line). English by ADR-M003 D0.5. Scanned by `gate:vocab` (scope `sentinel`).

| file | sha256 (LF) |
|---|---|
| `weth-book.fixture.json` | `f98827f94aa2eb941b71b556fa9240e73f53aa230faff1155ff6faddd58ac2bd` |

## 1. What it is
A REDUCED subset of real on-chain bytes recorded at Ethereum mainnet block **23545087** (WETH cluster, Aave v3
core, just before the recorded liquidations): `eth_call` responses keyed by `(to|data)` and the aToken `Transfer`
enumeration logs for **4 holders** (2 at-risk, 1 collateral-off, 1 no-debt). It is NOT the full book: the full
book (deploy→B, all aWETH holders) is a non-committed G1 artefact (ADR-U1 D9). The recorder decodes the raw
bytes fresh; the fixture never carries a pre-computed answer.

## 2. Acquisition (per entry — G2 C1)
- `calls`: `eth_call` at block `0x1674a7f` (23545087), quorum-2 by method (ADR-U1 D3) over the keyless
  providers `{drpc, mevblocker, blastapi, nodies}`; each stored value is the byte-identical result of two
  providers. Recorded 2026-09-19 by `apps/sentinel/src/ukemi/record.ts` (`ukemi_sha` `8aae7bbe…`).
- `enumeration_logs`: `eth_getLogs(aWETH, [Transfer])` over `{mevblocker, tenderly}`; the 4 entries were
  reduced by hand from the real enumeration (599 logs on the recorded window), keeping the exact `topics`,
  `data`, `blockNumber`, `logIndex`, `transactionHash` bytes. Two pulls contributed: entries whose `data`/index
  fields differ in completeness come from a first (pruned-fields) pull and a second (full-fields) pull — the
  recorder only reads `topics[2]` (recipient), so both are byte-faithful for what is consumed.
- `victim_vector`: the account liquidated at B+1 (`getUserAccountData`, `getUserConfiguration`, `getUserEMode`,
  aWETH `balanceOf`), same block, same quorum.
- `block_hash` / `block_ts` / `finalized_block`: `eth_getBlockByNumber` at B and at `finalized`, quorum-2.

## 3. Recipes a third party needs (not in ADR-U1 D6 — G2 C1)
- `holders_digest` = sha256 over the holder addresses **lower-cased, de-duplicated, `0x000…000` removed,
  sorted (byte order), joined with `"\n"` (no trailing newline)** — `apps/sentinel/src/ukemi/book.ts` (`holderSet`
  → `holders.join("\n")`).
- `book_digest` = sha256 of the canonical JSON (keys sorted recursively, no whitespace, UTF-8) of `book`;
  reproducible with `python -c "json.dumps(obj, sort_keys=True, separators=(',',':'), ensure_ascii=False)"`
  or `jq -S -c` (verified independently by the G2 reviewer: `034fbff9…b921`).
- `line_hash` = `ukemiLineHash` over the canonical timeline line with `prev_line_hash` (chained JSONL).

## 4. Pinned replay outputs (test `sentinel2_book_identical_to_pull`)
`book_digest 034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921` ·
`holders_digest 529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110` ·
`line_hash eead4f5357a07d3d3c026c4fe1e2ac7c48a35a2485f6777ccdef4251ceb73e15`.

## 5. Integrity
`.gitattributes` normalizes to `eol=lf`; the root test `series_pinned_are_declared_and_hashed` LF-normalizes
before hashing and requires the line above. Regenerate, never hand-edit values: re-record with `record.ts` at
the same block and reduce again; any drift re-pins the table and §4.
