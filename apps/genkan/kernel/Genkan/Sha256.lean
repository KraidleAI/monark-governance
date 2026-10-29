/-
SHA-256 (FIPS 180-4), on `List UInt8`, in `UInt32` arithmetic. The message is
read in blocks of 64 bytes as 16 big-endian words; the schedule is a window of 16 words that slides one word per round,
and the 64 rounds recurse on the list of the constants. The full blocks of the message are read in place (no copy of the
input); only its last bytes, fewer than 64, are padded, into one or two blocks. Every loop recurses structurally, in
tail position.
-/
namespace Genkan

/-- The eight working variables, or the eight words of the hash value. -/
structure Regs where
  a : UInt32
  b : UInt32
  c : UInt32
  d : UInt32
  e : UInt32
  f : UInt32
  g : UInt32
  h : UInt32

/-- The 16 words of the schedule from round t on: `w0` is the word of round t. -/
structure Window where
  w0 : UInt32
  w1 : UInt32
  w2 : UInt32
  w3 : UInt32
  w4 : UInt32
  w5 : UInt32
  w6 : UInt32
  w7 : UInt32
  w8 : UInt32
  w9 : UInt32
  w10 : UInt32
  w11 : UInt32
  w12 : UInt32
  w13 : UInt32
  w14 : UInt32
  w15 : UInt32

/-- The round constants: the first 32 bits of the fractional parts of the cube roots of the first 64 primes. -/
def K : List UInt32 := [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]

/-- The initial hash value: the first 32 bits of the fractional parts of the square roots of the first 8
primes. -/
def initial : Regs :=
  { a := 0x6a09e667, b := 0xbb67ae85, c := 0x3c6ef372, d := 0xa54ff53a,
    e := 0x510e527f, f := 0x9b05688c, g := 0x1f83d9ab, h := 0x5be0cd19 }

/-- Rotation to the right by `n`, 0 < n < 32. -/
def rotr (n : UInt32) (x : UInt32) : UInt32 := (x >>> n) ||| (x <<< (32 - n))

def bigSigma0 (x : UInt32) : UInt32 := rotr 2 x ^^^ rotr 13 x ^^^ rotr 22 x
def bigSigma1 (x : UInt32) : UInt32 := rotr 6 x ^^^ rotr 11 x ^^^ rotr 25 x
def smallSigma0 (x : UInt32) : UInt32 := rotr 7 x ^^^ rotr 18 x ^^^ (x >>> 3)
def smallSigma1 (x : UInt32) : UInt32 := rotr 17 x ^^^ rotr 19 x ^^^ (x >>> 10)
def ch (x y z : UInt32) : UInt32 := (x &&& y) ^^^ ((~~~x) &&& z)
def maj (x y z : UInt32) : UInt32 := (x &&& y) ^^^ (x &&& z) ^^^ (y &&& z)

/-- One round with the constant `k` and the word `w`. -/
def round (r : Regs) (k w : UInt32) : Regs :=
  let t1 := r.h + bigSigma1 r.e + ch r.e r.f r.g + k + w
  let t2 := bigSigma0 r.a + maj r.a r.b r.c
  { a := t1 + t2, b := r.a, c := r.b, d := r.c, e := r.d + t1, f := r.e, g := r.f, h := r.g }

/-- The window one round later: its last word is the schedule's next one, from the words t, t + 1, t + 9 and t + 14. -/
def slide (s : Window) : Window :=
  { w0 := s.w1, w1 := s.w2, w2 := s.w3, w3 := s.w4, w4 := s.w5, w5 := s.w6, w6 := s.w7, w7 := s.w8,
    w8 := s.w9, w9 := s.w10, w10 := s.w11, w11 := s.w12, w12 := s.w13, w13 := s.w14, w14 := s.w15,
    w15 := smallSigma1 s.w14 + s.w9 + smallSigma0 s.w1 + s.w0 }

/-- The rounds, one per constant. -/
def rounds : List UInt32 → Regs → Window → Regs
  | [], r, _ => r
  | k :: ks, r, s => rounds ks (round r k s.w0) (slide s)

/-- The hash value after one block. -/
def compress (h : Regs) (s : Window) : Regs :=
  let r := rounds K h s
  { a := h.a + r.a, b := h.b + r.b, c := h.c + r.c, d := h.d + r.d,
    e := h.e + r.e, f := h.f + r.f, g := h.g + r.g, h := h.h + r.h }

/-- A big-endian word, and the rest; `none` when fewer than 4 bytes remain. -/
def word : List UInt8 → Option (UInt32 × List UInt8)
  | b0 :: b1 :: b2 :: b3 :: xs =>
    some ((b0.toUInt32 <<< 24) ||| (b1.toUInt32 <<< 16) ||| (b2.toUInt32 <<< 8) ||| b3.toUInt32, xs)
  | _ => none

/-- A block of 64 bytes as its 16 words, and the rest; `none` when fewer than 64 bytes remain. -/
def block (xs : List UInt8) : Option (Window × List UInt8) := do
  let (w0, xs) ← word xs
  let (w1, xs) ← word xs
  let (w2, xs) ← word xs
  let (w3, xs) ← word xs
  let (w4, xs) ← word xs
  let (w5, xs) ← word xs
  let (w6, xs) ← word xs
  let (w7, xs) ← word xs
  let (w8, xs) ← word xs
  let (w9, xs) ← word xs
  let (w10, xs) ← word xs
  let (w11, xs) ← word xs
  let (w12, xs) ← word xs
  let (w13, xs) ← word xs
  let (w14, xs) ← word xs
  let (w15, xs) ← word xs
  pure ({ w0 := w0, w1 := w1, w2 := w2, w3 := w3, w4 := w4, w5 := w5, w6 := w6, w7 := w7,
          w8 := w8, w9 := w9, w10 := w10, w11 := w11, w12 := w12, w13 := w13, w14 := w14, w15 := w15 }, xs)

/-- At most `n` blocks, read while 64 bytes remain; the hash value and the bytes left. -/
def blocks : Nat → Regs → List UInt8 → Regs × List UInt8
  | 0, h, xs => (h, xs)
  | n + 1, h, xs =>
    match block xs with
    | some (s, rest) => blocks n (compress h s) rest
    | none => (h, xs)

/-- `n` big-endian bytes of `v`, before `acc`. -/
def beBytes : Nat → Nat → List UInt8 → List UInt8
  | 0, _, acc => acc
  | n + 1, v, acc => beBytes n (v / 256) ((v % 256).toUInt8 :: acc)

/-- The padding for a message of `len` bytes: 0x80, zeros, then the length in bits on 8 bytes. -/
def padding (len : Nat) : List UInt8 :=
  128 :: List.replicate ((119 - len % 64) % 64) 0 ++ beBytes 8 (8 * len) []

/-- The four big-endian bytes of a word, before `acc`. -/
def wordBytes (x : UInt32) (acc : List UInt8) : List UInt8 :=
  (x >>> 24).toUInt8 :: (x >>> 16).toUInt8 :: (x >>> 8).toUInt8 :: x.toUInt8 :: acc

/-- The 32 bytes of the digest. -/
def digestBytes (h : Regs) : List UInt8 :=
  wordBytes h.a (wordBytes h.b (wordBytes h.c (wordBytes h.d (wordBytes h.e (wordBytes h.f (wordBytes h.g (wordBytes h.h [])))))))

/-- SHA-256 of `xs`: its full blocks, then its last bytes and their padding (one or two blocks). -/
def sha256 (xs : List UInt8) : List UInt8 :=
  let len := xs.length
  let (h, rest) := blocks (len / 64) initial xs
  let (h, _) := blocks 2 h (rest ++ padding len)
  digestBytes h

end Genkan
