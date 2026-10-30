-- The I/O shell of the kernel, and nothing more: it reads all of stdin, refuses an input over 1 MiB (exit 3) before it
-- converts anything, and hands the bytes to Genkan.answer, where every decision lives. `none` exits 3 with nothing
-- written; `some out` writes the bytes of out to stdout, raw, then exits 0. Main itself writes nothing to stderr.
import Genkan.Format

/-- All of `s`, read in chunks of 64 KiB onto `acc`, up to the first empty chunk or as soon as the input passes the cap. A
read may return fewer bytes than asked, never more: with a fuel of `Genkan.cap + 2` the loop ends whatever the chunk sizes,
since `Genkan.cap + 1` reads of one byte or more pass the cap. -/
def readAll (s : IO.FS.Stream) : Nat → ByteArray → IO ByteArray
  | 0, acc => pure acc
  | fuel + 1, acc => do
    let chunk ← s.read 65536
    if chunk.isEmpty then pure acc
    else
      let next := acc ++ chunk
      if Genkan.admits next.size then readAll s fuel next else pure next

def main : IO UInt32 := do
  let stdin ← IO.getStdin
  let input ← readAll stdin (Genkan.cap + 2) ByteArray.empty
  if Genkan.admits input.size then
    match Genkan.answer input.data.toList with
    | some out =>
      let stdout ← IO.getStdout
      stdout.write (ByteArray.mk out.toArray)
      stdout.flush
      pure 0
    | none => pure 3
  else pure 3
