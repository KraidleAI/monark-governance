# PROVENANCE — Shogen `s3-binance` fixtures

Traceable origin for the four `s3-binance.*` fixtures imported into this repo and consumed by the
`attest` path (adapter `fromShogen`, ADR-M003 D10 / ADR-M005 D3). This file is English by
ADR-M003 D0.5; the fixtures themselves stay verbatim, so they are French-language-gate exempt BY PATH
(`scripts/lang-exempt.json` "paths", K-2) — see the note at the end.

- **Generated**: 2026-09-10. Verification authority = the Shogen verifier itself (re-play
  below), not the generator.

## Demonstrative label (ADR-M003 D3 / ADR-M005 D3, K-1)

The only real Shogen witness available is Binance `BTCUSDT`, self-notarized by Shogen. Any output that
carries `s3-binance` is therefore: **real, notary Shogen, demonstrative, not probative.** No live source
is contacted; the verifier is not executed at call time (the adapter reads these committed bytes).

## Source repository (read-only; never modified or committed)

- Repo: the local Shōgen checkout
- HEAD: `5b6469ae9999212a0db5d2fea0a169ff5d183a95`
- Working tree: **clean** (`git status --porcelain` in the checkout empty) both BEFORE and AFTER the
  build+run below. The build writes only to `target/` (git-ignored: `/target/`); no tracked file changed.
- Toolchain: `rustc 1.97.1 (8bab26f4f 2026-07-14)`, `cargo 1.97.1 (c980f4866 2026-06-30)`.
- The three source fixtures are byte-for-byte copies of
  `crates/shogen-verifier/tests/fixtures/s3-binance.{lot.cbor,constat.json,registre.txt}` in the Shōgen checkout
  (sha256 equal to the Shōgen checkout and to ADR-M003 D3).

## PF-5 — verifier re-play (owner = this worker, K-6)

Built with `--locked` (errors instead of touching `Cargo.lock`), then the binary was invoked directly
(no `cargo run`, so `cargo` progress never pollutes the captured streams). Run with cwd = the Shōgen
checkout root and repo-relative forward-slash paths, so the lot path embedded in stdout line 1
reproduces from any clone:

```
cd <shogen-checkout>
cargo build -p shogen-verifier --locked
target/debug/shogen-verifier.exe \
  crates/shogen-verifier/tests/fixtures/s3-binance.lot.cbor \
  --registre crates/shogen-verifier/tests/fixtures/s3-binance.registre.txt \
  --constat  crates/shogen-verifier/tests/fixtures/s3-binance.constat.json
```

Captured **separately** (ADR-M003 D3):

| stream | bytes | sha256 |
|---|---|---|
| exit code | — | **0** (lot conforms to the canonical subset) |
| stdout | 1679 | `b2528be9c75b388f538a4a2aa81daa268a3da4ecf4b6c5d52e314b9a27d3663d` |
| stderr | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty) |

stdout is Rust `println!` output (LF; measured 0 `\r` bytes) and is stored verbatim as
`s3-binance.verdict.txt`. It states the batch decodes and round-trips exactly, names the seven fields,
and gives the verdict, valid under three named residuals. It is the acceptance authority and the
independent oracle the decoder test cross-checks against.

## The four fixtures

| file | bytes | sha256 | role |
|---|---|---|---|
| `s3-binance.lot.cbor` | 7399 | `8700d88f87253f0fd8496402601dc7326362a2cd9e6614a9bf44b79052f1e5a3` | canonical CBOR batch (the witness); decoded by `cbor-canonique.ts` |
| `s3-binance.constat.json` | 875 | `7aba07cd8eb23ced38fee05195dfa57a9c30b981dae2faa293e977d076a05a25` | companion `Constat` (only real JSON on the Shogen side) — verifier INPUT |
| `s3-binance.registre.txt` | 616 | `899898227e7ab1f75bb2f65caed636fa881d82cbd03fa053c7362b14e33e304d` | published residual registry (18 identifiers) — verifier INPUT |
| `s3-binance.verdict.txt` | 1679 | `b2528be9c75b388f538a4a2aa81daa268a3da4ecf4b6c5d52e314b9a27d3663d` | re-played verifier stdout — produced here, verifier OUTPUT |

Byte composition (authoritative, Python byte count): `lot.cbor` is binary (420 NUL, 99 `\r`, 1520
non-ASCII bytes); the three text fixtures are LF-only (0 `\r`). Constat/registre are INPUTS to the
verifier; the registre is the published residual list (ADR-M003 D3 corrected the earlier
"registre = output" slip).

## Decoded structure vs the verifier output (cross-checked)

The zero-dependency decoder `packages/monark/src/cbor-canonique.ts` yields values that each appear
verbatim in `s3-binance.verdict.txt`: subject `https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`,
transport `tlsn-mpc/1`, `observed_at` = { clock `tlsn-mpc/1:connection_info.time`, instant `1786594228` },
utterance empreinte `c28a41ce…beea0`, one attestor `shogen:attestateur-de-demonstration-s3` (pinned key
71 octets), `transport_proof` 6034 octets, `residual` = the two the verifier names before the appended
delegation residual. The utterance carries its octets (944 bytes), and `sha256(utterance.bytes)` equals
the stored empreinte (the verifier's "octets_recalcules"; ADR-0005 rule 1). `encode(decode(bytes))`
reproduces the 7399 input bytes exactly.

**Decoder non-port (declared)**: the TS decoder is a faithful port of the strict shape/identifier checks
of the Shogen core (`cbor.rs`, `lot.rs`, `temoignage_canonique.rs`) but does NOT port the ADR-0016
`subject`-canonicity predicate (`subject.rs`). The committed `s3-binance.verdict.txt` is the acceptance
authority for this fixture. One mechanism difference, equivalent outcome: the identifier checks iterate
JS code points where the Rust iterates UTF-8 bytes; over the ASCII-only identifier domain both accept and
reject identically (any non-ASCII input is refused by both on its first char / byte >= 0x80).

## Line endings / commit integrity

- `.gitattributes` marks `*.cbor binary`: the batch has NUL bytes (git would auto-detect binary anyway),
  and the explicit marking makes the pinned sha256 survive commit deterministically rather than by
  content sniffing.
- The three text fixtures are already LF-only, so the repo `eol=lf` normalization is a no-op for them
  and their sha256 survives commit unchanged. (A shell `grep -c $'\r'` over-counts CR on these files —
  a Git-Bash artifact; `bytes.count(13)` in Python is authoritative and gives 0 for the text fixtures.)
- **Committed-blob sha256 checked equal to the pins**, so the pin is the byte string git will store, not
  merely the working-tree file. Reversible check (no commit): `git add fixtures/s3-binance.*`, then
  `git show :<path> | sha256sum` for the four, then `git reset`. All four blob sha256 matched: `lot.cbor`
  8700d88f…, `constat.json` 7aba07cd…, `registre.txt` 899898…, `verdict.txt` b2528be9….
- **Formed pending (H4 export)**: `.gitattributes` is not in the export whitelist (`export-public.mjs`),
  so the public mirror relies on git's own binary auto-detection. That is safe for `lot.cbor` (NUL
  present) and a no-op for the LF text fixtures; whitelisting `.gitattributes` at H4 removes the
  reliance. Not a bare debt — owned by H4.
