/-
The judge of the gate (mode 1), pure. A context is "GNKC" action:u8, venues:u8 then that many `str`s, assets:u8 then that
many `str` cap:u128 pairs, with no byte after: action 1 commit, 2 defer, 3 abstain (the action of HIKAE's GateDecision on
the signal the order follows), the venues the orders may target, the assets they may move with each one's cap, no name
twice in a list. A request of mode 1 is "GNKQ" 1 ctx:sec order:sec, with no byte after. The judge allows a SWAP, an EXIT or
an OPEN, and nothing else; an EXIT on a listed venue, whatever the action, the asset and the amount; any other order with
the action commit, a listed asset, an amount within that asset's cap and, for a SWAP, a listed assetOut and a minOut above
0. `respond` answers a mode 1 request with one line, `allow` or `deny <reason>`, and any other request as `answer` does.
-/
import Genkan.Format

namespace Genkan

/-- HIKAE's decision on the signal the order follows. -/
inductive Action where
  | commit
  | defer
  | abstain

/-- A decoded context: the action, the venues, and the assets with their caps. -/
structure Context where
  action : Action
  venues : List (List UInt8)
  assets : List (List UInt8 × Nat)

/-- The action of a code, 1 to 3. -/
def actionOf (code : Nat) : Option Action :=
  if code == 1 then some Action.commit
  else if code == 2 then some Action.defer
  else if code == 3 then some Action.abstain
  else none

/-- `n` strs, pushed in reverse on `acc`, then the rest; `none` when they are not there. -/
def strs : Nat → List (List UInt8) → List UInt8 → Option (List (List UInt8) × List UInt8)
  | 0, acc, xs => some (acc.reverse, xs)
  | n + 1, acc, xs =>
    match str xs with
    | some (s, rest) => strs n (s :: acc) rest
    | none => none

/-- `n` pairs of a str and a u128, pushed in reverse on `acc`, then the rest; `none` when they are not there. -/
def capped : Nat → List (List UInt8 × Nat) → List UInt8 → Option (List (List UInt8 × Nat) × List UInt8)
  | 0, acc, xs => some (acc.reverse, xs)
  | n + 1, acc, xs =>
    match str xs with
    | some (s, rest) =>
      match u128 rest with
      | some (cap, rest) => capped n ((s, cap) :: acc) rest
      | none => none
    | none => none

/-- Whether no name of the list comes twice. -/
def distinct : List (List UInt8) → Bool
  | [] => true
  | x :: xs => !(xs.contains x) && distinct xs

/-- The context the bytes hold, all of them; `none` when they hold none. -/
def context (xs : List UInt8) : Option Context := do
  let xs ← expect (text "GNKC") xs
  let (code, xs) ← u8 xs
  let action ← actionOf code
  let (nv, xs) ← u8 xs
  let (venues, xs) ← strs nv [] xs
  let (na, xs) ← u8 xs
  let (assets, xs) ← capped na [] xs
  if xs.isEmpty && distinct venues && distinct (assets.map Prod.fst) then
    some { action := action, venues := venues, assets := assets }
  else none

/-- The cap of an asset, the first pair of the list that names it; `none` when none does. -/
def capOf (asset : List UInt8) : List (List UInt8 × Nat) → Option Nat
  | [] => none
  | (a, cap) :: rest => if a == asset then some cap else capOf asset rest

/-- Why the judge refuses: the ctx or the order does not decode, or the order breaks one rule. -/
inductive Reason where
  | badCtx
  | badOrder
  | kind
  | venue
  | notCommit
  | asset
  | overCap
  | assetOut
  | minOut

/-- The judge's verdict. -/
inductive Verdict where
  | allow
  | deny (why : Reason)

/-- The verdict on an order under a context. The rules, in order: the kind is SWAP (3), EXIT (4) or OPEN (5); the target
is a listed venue; an EXIT is then allowed; any other order needs the action commit, a listed asset and an amount within
its cap; a SWAP needs a listed assetOut and a minOut above 0. -/
def judge (c : Context) (o : Order) : Verdict :=
  if !(o.kind == 3 || o.kind == 4 || o.kind == 5) then Verdict.deny Reason.kind
  else if !(c.venues.contains o.target) then Verdict.deny Reason.venue
  else if o.kind == 4 then Verdict.allow
  else
    match c.action with
    | Action.commit =>
      match capOf o.asset c.assets with
      | none => Verdict.deny Reason.asset
      | some cap =>
        if cap < o.amount then Verdict.deny Reason.overCap
        else if o.kind == 3 then
          match o.swapOut with
          | some (out, minOut) =>
            if (capOf out c.assets).isNone then Verdict.deny Reason.assetOut
            else if minOut == 0 then Verdict.deny Reason.minOut
            else Verdict.allow
          | none => Verdict.deny Reason.assetOut
        else Verdict.allow
    | _ => Verdict.deny Reason.notCommit

/-- The text of a reason. -/
def reasonText : Reason → String
  | Reason.badCtx => "bad-ctx"
  | Reason.badOrder => "bad-order"
  | Reason.kind => "kind"
  | Reason.venue => "venue"
  | Reason.notCommit => "not-commit"
  | Reason.asset => "asset"
  | Reason.overCap => "over-cap"
  | Reason.assetOut => "asset-out"
  | Reason.minOut => "min-out"

/-- Mode 1's line for a verdict, ended by one byte 0x0a. -/
def verdictLine : Verdict → List UInt8
  | Verdict.allow => text "allow" ++ [10]
  | Verdict.deny why => text "deny " ++ text (reasonText why) ++ [10]

/-- The ctx and the order of a mode 1 request, all of it; `none` when the input is not one. -/
def judgeRequest (input : List UInt8) : Option (List UInt8 × List UInt8) := do
  let xs ← expect (text "GNKQ") input
  let (mode, xs) ← u8 xs
  if mode == 1 then
    let (ctx, xs) ← sec xs
    let ord ← lastSec xs
    some (ctx, ord)
  else none

/-- The verdict on the two secs of a mode 1 request: the ctx is decoded first, then the order, then judged. -/
def verdictOf (ctx ord : List UInt8) : Verdict :=
  match context ctx with
  | none => Verdict.deny Reason.badCtx
  | some c =>
    match order ord with
    | none => Verdict.deny Reason.badOrder
    | some o => judge c o

/-- The answer to a whole request: a mode 1 request its verdict's line; any other `answer`'s answer. -/
def respond (input : List UInt8) : Option (List UInt8) :=
  match judgeRequest input with
  | some (ctx, ord) => some (verdictLine (verdictOf ctx ord))
  | none => answer input

end Genkan
