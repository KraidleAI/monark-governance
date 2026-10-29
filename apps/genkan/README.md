# Genkan

Status: upcoming.

Genkan is an order gate whose decisions will come from a Lean kernel. This package holds the kernel, its vectors, the order encoder of the gate and three scripts, and nothing more:

- `kernel/`: a Lean 4 kernel built with the pinned toolchain (`leanprover/lean4:v4.32.1`): a library `Genkan` (`Genkan/Bytes.lean`, the byte readers; `Genkan/Sha256.lean`, SHA-256; `Genkan/Format.lean`, the formats and the answer) and an executable whose `Main.lean` only reads stdin and writes stdout. There is no judge and no theorem yet. The executable reads one request on stdin and answers:
  - mode 2 (decode): one line ended by a single `0x0a`, `invalid` when the order does not decode, else `order kind=<k> flags=<f> target=<t> asset=<a> amount=<n>`, followed for a SWAP by ` assetOut=<o> minOut=<m>`, numbers in decimal; exit 0;
  - mode 3 (SHA-256): the 32 bytes of the digest of its bytes, raw; exit 0;
  - exit 3, with nothing on stdout or stderr, for mode 1 until the judge exists, for a malformed request and for an input over 1 MiB (1 048 576 bytes).
- `kernel/vectors/gnk1.json`: the vectors of the formats, written by hand from them: orders that decode, with their fields and their line, orders that do not, fields the encoder refuses, requests the kernel refuses, and the inputs of the SHA-256 check (no digest is stored: the tests compare with `node:crypto`). `test/frame.test.ts` reads them against the encoder, `test/formats.kernel.test.ts` against the built kernel.
- `src/frame.ts`: `encodeOrder`, the bytes of an order from its fields; a field outside the format throws a `RangeError`.
- `scripts/lake.mjs`: runs the pinned Lake of that toolchain, by its path, in `kernel/`.
- `scripts/audit.mjs`: reads the kernel sources (all but the build dir `.lake` at the root) and refuses banned constructs (options and debugging constructs among them), the other axioms and the debugging functions of `Init` named in any part of a name, panics (`]!`, `outOfBounds`, and any part of a name that holds `!` or the word `panic` in any case, the interpolation heads `s!`, `f!` and `println!` excepted), `#` commands other than `#check` and `#print`, `private` and theorem names that are not plain in the theorem files, imports other than `Genkan` and its plain modules, and an unpinned lakefile. A tactic's config can add an axiom that no word shows, so the axiom records decide: given the `#print axioms` output, `main` and each theorem need a record within `propext`, `Classical.choice` and `Quot.sound`. Without records the audit fails; `--source-only` judges the sources alone, and refuses a `.lake` of any case at the kernel root: before the build, it could only hold files from the repository, which lake would reuse and no rule reads.
- `scripts/records.mjs`: writes those records from the built kernel. It takes the roots from `audit.mjs --roots` (`main`, then each theorem with its module), refuses a root whose name is not plain (dotted ASCII components), and asks the pinned Lean for each one's `#print axioms`, through `lake.mjs`; it writes the file only when Lean succeeds.

The formats, integers big-endian, a `str` a length byte of 1 to 128 then that many bytes of `0-9`, `a-z`, `:`, `.`, `_`, `/`, `@`, `-`, a `sec` a 4-byte length then that many bytes, with no byte after either form:

```
order := "GNK1" kind:u8 flags:u8 target:str asset:str amount:u128 [assetOut:str minOut:u128 when kind = 3]
         kind 1 TRANSFER, 2 APPROVE, 3 SWAP, 4 EXIT, 5 OPEN; flags 1 for an EXIT, else 0
req   := "GNKQ" mode:u8, then mode 1 ctx:sec order:sec | mode 2 order:sec | mode 3 bytes:sec
```

CI runs the source audit before any Lean runs, then the build, the records and the audit that judges them:

```
node apps/genkan/scripts/audit.mjs --source-only
ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs build
ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --out <file>
node apps/genkan/scripts/audit.mjs --axioms-from <file>
```
