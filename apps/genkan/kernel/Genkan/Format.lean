/-
The formats of the gate and the kernel's answer, pure. An `order` is "GNK1" kind:u8 flags:u8 target:str asset:str
amount:u128, then assetOut:str minOut:u128 if and only if kind = 3, with no byte after; kinds 1 TRANSFER, 2 APPROVE, 3 SWAP,
4 EXIT, 5 OPEN, and flags = 1 if and only if kind = 4, else 0. A request is "GNKQ" mode:u8, then its `sec`s, with no byte
after: mode 1 (the judge, which does not exist yet) ctx:sec order:sec, mode 2 (decode) order:sec, mode 3 (sha256) bytes:sec.
`answer` decides on the whole input: `none` is a refusal (exit 3, nothing written); `some out` is the bytes of stdout.
-/
import Genkan.Bytes
import Genkan.Sha256

namespace Genkan

/-- The largest input the kernel reads, in bytes: 1 MiB. -/
def cap : Nat := 1048576

/-- Whether an input of `size` bytes is read; a larger one is refused before any decoding. -/
def admits (size : Nat) : Bool := size ≤ cap

/-- The bytes of an ASCII text. -/
def text (s : String) : List UInt8 := s.toUTF8.data.toList

/-- The rest of the second list after the bytes of the first; `none` when it does not start with them. -/
def expect : List UInt8 → List UInt8 → Option (List UInt8)
  | [], xs => some xs
  | t :: ts, x :: xs => if x == t then expect ts xs else none
  | _ :: _, [] => none

/-- A decoded order. `swapOut` is a SWAP's assetOut and minOut. -/
structure Order where
  kind : Nat
  flags : Nat
  target : List UInt8
  asset : List UInt8
  amount : Nat
  swapOut : Option (List UInt8 × Nat)

/-- The kinds of the formats, 1 to 5. -/
def validKind (kind : Nat) : Bool := 1 ≤ kind && kind ≤ 5

/-- The flags of a kind: 1 for an EXIT, else 0. -/
def flagsOf (kind : Nat) : Nat := if kind == 4 then 1 else 0

/-- A SWAP's assetOut and minOut, and the rest. -/
def swapTail (xs : List UInt8) : Option (Option (List UInt8 × Nat) × List UInt8) := do
  let (assetOut, xs) ← str xs
  let (minOut, xs) ← u128 xs
  pure (some (assetOut, minOut), xs)

/-- The order the bytes hold, all of them; `none` when they hold none. -/
def order (xs : List UInt8) : Option Order := do
  let xs ← expect (text "GNK1") xs
  let (kind, xs) ← u8 xs
  let (flags, xs) ← u8 xs
  let (target, xs) ← str xs
  let (asset, xs) ← str xs
  let (amount, xs) ← u128 xs
  let (swapOut, xs) ← if kind == 3 then swapTail xs else some (none, xs)
  if validKind kind && flags == flagsOf kind && xs.isEmpty then
    some { kind := kind, flags := flags, target := target, asset := asset, amount := amount, swapOut := swapOut }
  else none

/-- The decimal digits of `n`, before `acc`. The fuel is never short: it starts at `n`, and `n` stays at most the fuel (it
goes to `n / 10` while the fuel goes down by one), so it reaches 0 only when `n` is 0. -/
def digits : Nat → Nat → List UInt8 → List UInt8
  | 0, _, acc => 48 :: acc
  | fuel + 1, n, acc =>
    if n < 10 then (48 + n).toUInt8 :: acc else digits fuel (n / 10) ((48 + n % 10).toUInt8 :: acc)

/-- `n` in decimal, without leading zeros (`0` for zero). -/
def decimal (n : Nat) : List UInt8 := digits n n []

/-- The line of mode 2 for an order, without its line end. -/
def orderLine (o : Order) : List UInt8 :=
  let swap := match o.swapOut with
    | some (assetOut, minOut) => text " assetOut=" ++ assetOut ++ text " minOut=" ++ decimal minOut
    | none => []
  text "order kind=" ++ decimal o.kind ++ text " flags=" ++ decimal o.flags ++ text " target=" ++ o.target ++
    text " asset=" ++ o.asset ++ text " amount=" ++ decimal o.amount ++ swap

/-- Mode 2: one line ended by one byte 0x0a, the order's or `invalid`. -/
def decodeLine (xs : List UInt8) : List UInt8 :=
  match order xs with
  | some o => orderLine o ++ [10]
  | none => text "invalid" ++ [10]

/-- The bytes of a request's one `sec`, which must be all that remains. -/
def lastSec (xs : List UInt8) : Option (List UInt8) :=
  match sec xs with
  | some (body, []) => some body
  | _ => none

/-- The answer to a whole request: mode 2 its line, mode 3 the 32 bytes of the digest; `none` for any other request. -/
def answer (input : List UInt8) : Option (List UInt8) := do
  let xs ← expect (text "GNKQ") input
  let (mode, xs) ← u8 xs
  let body ← lastSec xs
  if mode == 2 then some (decodeLine body) else if mode == 3 then some (sha256 body) else none

end Genkan
