/-
The byte readers of the formats, on `List UInt8`: each gives the value read and the rest, or `none` when the bytes do not
hold it. Integers are big-endian; a `str` is a length byte of 1 to 128, then that many bytes of the 42-byte alphabet; a
`sec` is a `u32` length, then that many bytes. Every reader recurses structurally on a count or on the list, in tail
position, so a request of 1 MiB runs in constant stack.
-/
namespace Genkan

/-- `n` bytes read big-endian after `acc`, and the rest; `none` when fewer than `n` remain. -/
def beNat : Nat → Nat → List UInt8 → Option (Nat × List UInt8)
  | 0, acc, xs => some (acc, xs)
  | n + 1, acc, b :: xs => beNat n (acc * 256 + b.toNat) xs
  | _ + 1, _, [] => none

/-- One byte. -/
def u8 (xs : List UInt8) : Option (Nat × List UInt8) := beNat 1 0 xs

/-- Four bytes, big-endian. -/
def u32 (xs : List UInt8) : Option (Nat × List UInt8) := beNat 4 0 xs

/-- Sixteen bytes, big-endian. -/
def u128 (xs : List UInt8) : Option (Nat × List UInt8) := beNat 16 0 xs

/-- The 42 bytes of a `str`: `-` `.` `/` `0`-`9` `:` (0x2d to 0x3a), `@` (0x40), `_` (0x5f), `a`-`z` (0x61 to 0x7a). -/
def isAlpha (b : UInt8) : Bool :=
  (45 ≤ b && b ≤ 58) || b == 64 || b == 95 || (97 ≤ b && b ≤ 122)

/-- `n` bytes of the alphabet, pushed in reverse on `acc`, then the rest; `none` on a byte outside it or when fewer remain. -/
def alphaBytes : Nat → List UInt8 → List UInt8 → Option (List UInt8 × List UInt8)
  | 0, acc, xs => some (acc.reverse, xs)
  | n + 1, acc, b :: xs => if isAlpha b then alphaBytes n (b :: acc) xs else none
  | _ + 1, _, [] => none

/-- A `str`: its length byte, 1 to 128, then that many alphabet bytes. -/
def str (xs : List UInt8) : Option (List UInt8 × List UInt8) :=
  match u8 xs with
  | some (len, rest) => if 1 ≤ len && len ≤ 128 then alphaBytes len [] rest else none
  | none => none

/-- `n` bytes, pushed in reverse on `acc`, then the rest; `none` when fewer remain. -/
def takeBytes : Nat → List UInt8 → List UInt8 → Option (List UInt8 × List UInt8)
  | 0, acc, xs => some (acc.reverse, xs)
  | n + 1, acc, b :: xs => takeBytes n (b :: acc) xs
  | _ + 1, _, [] => none

/-- A `sec`: its `u32` length, then that many bytes, and the rest. -/
def sec (xs : List UInt8) : Option (List UInt8 × List UInt8) :=
  match u32 xs with
  | some (len, rest) => takeBytes len [] rest
  | none => none

end Genkan
