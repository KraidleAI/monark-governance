# Genkan

Status: the kernel judges orders (mode 1), with its theorems; the harness's `judge` tool runs it on the served path (`apps/harness/src/kernel.ts`, step 5 of `ROADMAP.md`).

Genkan is the order gate: a Lean kernel decides whether an order may leave. This package holds the kernel, its vectors, the frames of the gate and three scripts, and nothing more:

- `kernel/`: a Lean 4 kernel built with the pinned toolchain (`leanprover/lean4:v4.32.1`): a library `Genkan` (`Genkan/Bytes.lean`, the byte readers; `Genkan/Sha256.lean`, SHA-256; `Genkan/Format.lean`, the order format and the answers of modes 2 and 3; `Genkan/Judge.lean`, the context format, the judge and `respond`, the answer to any request; `Genkan/Theorems.lean`, the judge's theorems) and an executable whose `Main.lean` only reads stdin, hands the bytes to `Genkan.respond` and writes stdout. The executable reads one request on stdin and answers:
  - mode 1 (judge): one line ended by a single `0x0a`, `allow` or `deny <reason>`; exit 0;
  - mode 2 (decode): one line ended by a single `0x0a`, `invalid` when the order does not decode, else `order kind=<k> flags=<f> target=<t> asset=<a> amount=<n>`, followed for a SWAP by ` assetOut=<o> minOut=<m>`, numbers in decimal; exit 0;
  - mode 3 (SHA-256): the 32 bytes of the digest of its bytes, raw; exit 0;
  - exit 3, with nothing on stdout or stderr, for a malformed request (any mode) and for an input over 1 MiB (1 048 576 bytes).
- `kernel/vectors/gnk1.json`: the vectors of the order format, written by hand from it: orders that decode, with their fields and their line, orders that do not, fields the encoder refuses, requests the kernel refuses, and the inputs of the SHA-256 check (no digest is stored: the tests compare with `node:crypto`). `test/frame.test.ts` reads them against the encoder, `test/formats.kernel.test.ts` against the built kernel.
- `kernel/vectors/judge.json`: the vectors of mode 1: contexts that decode, with their fields, contexts that do not, the orders of the cases, 82 cases (a context, an order, the kernel's line), mode 1 requests the kernel refuses, and fields `encodeContext` refuses. Their hex was computed from the formats by a throwaway script independent of `src/frame.ts` and of the kernel; their lines were written by hand from the rules below. `test/judge.test.ts` reads them against the frames (the fields of each context and of each order encode to its hex), `test/formats.kernel.test.ts` against the built kernel.
- `src/frame.ts`: `encodeOrder`, the bytes of an order; `encodeContext`, the bytes of a context; `encodeJudgeRequest`, the mode 1 request of a context and an order; `readVerdict`, the kernel's answer read fail-closed (an allow only for exit 0 and exactly the line `allow`). A field outside the formats throws a `RangeError`.
- `scripts/lake.mjs`: runs the pinned Lake of that toolchain, by its path, in `kernel/`.
- `scripts/audit.mjs`: reads the kernel sources (all but the build dir `.lake` at the root) and refuses banned constructs (options and debugging constructs among them), the other axioms and the debugging functions of `Init` named in any part of a name, panics (`]!`, `outOfBounds`, and any part of a name that holds `!` or the word `panic` in any case, the interpolation heads `s!`, `f!` and `println!` excepted), `#` commands other than `#check` and `#print`, `private` and theorem names that are not plain in the theorem files, imports other than `Genkan` and its plain modules, and an unpinned lakefile. It bounds what the kernel's sources may name to stdin and stdout: outside the lakefile, a name that opens with `IO`, `EIO`, `BaseIO`, `EST`, `ST` or `System`, the names of `Init` that read the clock or escape the type system (`timeit`, `allocprof`, `unsafeIO`, `unsafeEIO`, `unsafeBaseIO`) in any part of a name, `println!`, and a leading dot (`.getStderr` names `IO.getStderr` through the expected type) are refused; `Main.lean` alone may name `IO`, `IO.getStdin`, `IO.getStdout` and `IO.FS.Stream`, may not write `open` or `namespace`, and must declare `def main : IO UInt32`. These rules read the sources only: before `main`, the `Init` library the kernel links runs its own initializer of `IO.stdGenRef`, which seeds a random generator from `IO.getRandomBytes 8`. A tactic's config can add an axiom that no word shows, so the axiom records decide: given the `#print axioms` output, `main` and each theorem need a record within `propext`, `Classical.choice` and `Quot.sound`. Without records the audit fails; `--source-only` judges the sources alone, and refuses a `.lake` of any case at the kernel root: before the build, it could only hold files from the repository, which lake would reuse and no rule reads. `--modules` lists the kernel's modules, one per line: each Lean file but the root `lakefile.lean`, named by its path.
- `scripts/records.mjs`: writes those records from the built kernel. It takes the roots from `audit.mjs --roots` (`main`, then each theorem with its module), refuses a root whose name is not plain (dotted ASCII components), and asks the pinned Lean for each one's `#print axioms`, through `lake.mjs`; it writes the file only when Lean succeeds. With `--replay` it takes the modules from `audit.mjs --modules`, refuses a module whose name is not plain, and replays each one with the toolchain's `leanchecker`, through `lake.mjs`, stopping at the first refusal; it writes no file. `leanchecker` replays each declaration of a module in Lean's kernel against the environment its imports give: a check against environment hacking, not an external verifier.

The formats, integers big-endian, a `str` a length byte of 1 to 128 then that many bytes of `0-9`, `a-z`, `:`, `.`, `_`, `/`, `@`, `-`, a `sec` a 4-byte length then that many bytes, with no byte after any form:

```
order := "GNK1" kind:u8 flags:u8 target:str asset:str amount:u128 [assetOut:str minOut:u128 when kind = 3]
         kind 1 TRANSFER, 2 APPROVE, 3 SWAP, 4 EXIT, 5 OPEN; flags 1 for an EXIT, else 0
ctx   := "GNKC" action:u8 nv:u8 venue:str{nv} na:u8 (asset:str cap:u128){na}
         action 1 commit, 2 defer, 3 abstain (the action of HIKAE's GateDecision); no venue twice, no asset twice
req   := "GNKQ" mode:u8, then mode 1 ctx:sec order:sec | mode 2 order:sec | mode 3 bytes:sec
```

## The judge

Mode 1 decodes the context first, then the order, then applies the rules in this order; the first that fails names the reason:

| Reason | When |
|---|---|
| `bad-ctx` | the ctx sec holds no context |
| `bad-order` | the order sec holds no order |
| `kind` | the order is not a SWAP, an EXIT or an OPEN: a TRANSFER or an APPROVE is always denied |
| `venue` | the target is not a listed venue |
| (allow) | an EXIT on a listed venue is allowed, whatever the action, the asset and the amount |
| `not-commit` | the action is not commit |
| `asset` | the asset is not listed |
| `over-cap` | the amount passes the asset's cap (an amount equal to the cap passes) |
| `asset-out` | a SWAP's assetOut is not listed |
| `min-out` | a SWAP's minOut is 0 |

`Genkan/Theorems.lean` proves, on the decoded context and order, each line of that table that bounds an allow (`judge_allow_kind`, `judge_transfer`, `judge_approve`, `judge_allow_venue`, `judge_allow_commit`, `judge_not_commit`, `judge_allow_listed`, `judge_allow_swap_listed`) and the EXIT's (`judge_exit`); that a decoded context names no venue and no asset twice, so the cap an allow is held to is the one cap of its asset (`context_distinct`, `judge_allow_one_cap`); on the bytes, that the answer to a mode 1 input is its verdict's line (`respond_mode1`), that, whatever the input, `allow` comes from the verdict allow only (`respond_allow`: a mode 2 line starts with `o` or `i`, a mode 3 digest has 32 bytes), and `respond_allow_safe` gathers them in one statement over any input; and that the request built from a ctx and an order is judged on exactly them (`respond_judgeBytes`). CI replays every module with `leanchecker` and audits each theorem's axiom record.

What the judge does not guarantee:

- **The action is the caller's word.** The context carries HIKAE's action as one byte; nothing in it binds that byte to a GateDecision (its `request_sha256`, its signal). Whoever builds the context must take the action from HIKAE's own answer: the harness's `judge` tool takes it from the GateDecision it computes on the same call.
- **The lists and the caps are the caller's too.** The judge holds an order to the venues, assets and caps it is given; it does not know balances, positions, prices or the venue's own rules.
- **An EXIT on a listed venue always passes**, so that HIKAE's silence never traps a position; a venue taken off the list blocks the EXITs there too. The kind is the order's word: an order labelled EXIT passes on its venue alone, for any asset and any amount up to 2^128 − 1, whatever the action. Whoever executes it must make it reduce or close a position and nothing else (reduce-only at the venue).
- **A cap holds one order, not a total.** The judge is stateless: it does not add up the orders it allows, so several orders, each within the cap, pass. A cap read as an exposure limit needs a ledger outside the judge.
- **`minOut` above 0 is not a slippage guard.** A SWAP with `minOut` 1 passes; the price it accepts is the caller's.

CI runs the source audit before any Lean runs, then the build, the replay of the kernel's modules, the records and the audit that judges them:

```
node apps/genkan/scripts/audit.mjs --source-only
ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs build
ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --replay
ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --out <file>
node apps/genkan/scripts/audit.mjs --axioms-from <file>
```
