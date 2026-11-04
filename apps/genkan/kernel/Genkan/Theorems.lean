/-
The theorems of the judge (Genkan/Judge.lean), proved by Lean's kernel and replayed by the toolchain's leanchecker in CI;
each one's `#print axioms` record stays within propext, Classical.choice and Quot.sound (scripts/audit.mjs). On the
decoded context and order: the judge never allows a TRANSFER or an APPROVE; an allow names a listed venue; an allow of
anything but an EXIT needs the action commit, a listed asset and an amount within its cap; a SWAP's allow needs a listed
assetOut and a minOut above 0; an EXIT on a listed venue is always allowed, whatever HIKAE decided; a decoded context names
no venue and no asset twice, so an asset has one cap. On the bytes: the answer to a mode 1 request is its verdict's line;
whatever the input, the line `allow` comes from the verdict allow only (a mode 2 line starts with `o` or `i`, a mode 3
digest has 32 bytes); and the request built from a ctx and an order (`judgeBytes`) is judged on exactly that ctx and that
order.
-/
import Genkan.Judge

namespace Genkan

/-- `expect t` reads `t` off the front of `t ++ xs`. -/
theorem expect_append (t xs : List UInt8) : expect t (t ++ xs) = some xs := by
  induction t with
  | nil => rfl
  | cons a t ih => simp [expect, ih]

/-- The judge allows a SWAP (3), an EXIT (4) or an OPEN (5), and no other kind. -/
theorem judge_allow_kind (c : Context) (o : Order) (h : judge c o = Verdict.allow) :
    o.kind = 3 ∨ o.kind = 4 ∨ o.kind = 5 := by
  unfold judge at h
  split at h
  · cases h
  · simp at *; omega

/-- A TRANSFER (1) is denied, whatever the context. -/
theorem judge_transfer (c : Context) (o : Order) (h : o.kind = 1) : judge c o = Verdict.deny Reason.kind := by
  simp [judge, h]

/-- An APPROVE (2) is denied, whatever the context. -/
theorem judge_approve (c : Context) (o : Order) (h : o.kind = 2) : judge c o = Verdict.deny Reason.kind := by
  simp [judge, h]

/-- An allowed order targets a listed venue. -/
theorem judge_allow_venue (c : Context) (o : Order) (h : judge c o = Verdict.allow) : o.target ∈ c.venues := by
  unfold judge at h
  split at h
  · cases h
  · split at h
    · cases h
    · simp_all

/-- An EXIT on a listed venue is allowed, whatever the action, the asset and the amount: the gate never traps a position. -/
theorem judge_exit (c : Context) (o : Order) (hk : o.kind = 4) (hv : o.target ∈ c.venues) :
    judge c o = Verdict.allow := by
  simp [judge, hk, hv]

/-- An allowed order other than an EXIT follows the action commit. -/
theorem judge_allow_commit (c : Context) (o : Order) (h : judge c o = Verdict.allow) (hk : o.kind ≠ 4) :
    c.action = Action.commit := by
  unfold judge at h
  split at h
  · cases h
  · split at h
    · cases h
    · split at h
      · simp_all
      · split at h
        · assumption
        · cases h

/-- Without the action commit, nothing but an EXIT is allowed. -/
theorem judge_not_commit (c : Context) (o : Order) (ha : c.action ≠ Action.commit) (hk : o.kind ≠ 4) :
    judge c o ≠ Verdict.allow :=
  fun h => ha (judge_allow_commit c o h hk)

/-- An allowed order other than an EXIT moves an asset whose cap it does not pass. -/
theorem judge_allow_cap (c : Context) (o : Order) (h : judge c o = Verdict.allow) (hk : o.kind ≠ 4) :
    ∃ cap, capOf o.asset c.assets = some cap ∧ o.amount ≤ cap := by
  unfold judge at h
  split at h
  · cases h
  · split at h
    · cases h
    · split at h
      · simp_all
      · split at h
        · split at h
          · cases h
          · split at h
            · cases h
            · exact ⟨_, ‹_›, by omega⟩
        · cases h

/-- An allowed SWAP names its assetOut, a listed one, and a minOut above 0. -/
theorem judge_allow_swap (c : Context) (o : Order) (h : judge c o = Verdict.allow) (hk : o.kind = 3) :
    ∃ out minOut, o.swapOut = some (out, minOut) ∧ (capOf out c.assets).isSome ∧ 0 < minOut := by
  unfold judge at h
  split at h
  · cases h
  · split at h
    · cases h
    · split at h
      · simp_all
      · split at h
        · split at h
          · cases h
          · split at h
            · cases h
            · split at h
              · split at h
                · split at h
                  · cases h
                  · split at h
                    · cases h
                    · refine ⟨_, _, ‹_›, ?_, ?_⟩
                      · cases hc : capOf _ c.assets <;> simp_all
                      · simp at *
                        omega
                · cases h
              · simp_all
        · cases h

/-- The cap `capOf` finds is the cap of a pair of the list. -/
theorem capOf_mem (asset : List UInt8) (l : List (List UInt8 × Nat)) (cap : Nat) (h : capOf asset l = some cap) :
    (asset, cap) ∈ l := by
  induction l with
  | nil => simp [capOf] at h
  | cons p rest ih =>
    obtain ⟨a, c⟩ := p
    simp only [capOf] at h
    split at h
    · simp_all
    · exact List.mem_cons_of_mem _ (ih h)

/-- An allowed order other than an EXIT moves a listed asset, within its cap. -/
theorem judge_allow_listed (c : Context) (o : Order) (h : judge c o = Verdict.allow) (hk : o.kind ≠ 4) :
    ∃ cap, (o.asset, cap) ∈ c.assets ∧ o.amount ≤ cap := by
  obtain ⟨cap, hc, hl⟩ := judge_allow_cap c o h hk
  exact ⟨cap, capOf_mem _ _ _ hc, hl⟩

/-- An allowed SWAP's assetOut is listed and its minOut is above 0. -/
theorem judge_allow_swap_listed (c : Context) (o : Order) (h : judge c o = Verdict.allow) (hk : o.kind = 3) :
    ∃ out minOut cap, o.swapOut = some (out, minOut) ∧ (out, cap) ∈ c.assets ∧ 0 < minOut := by
  obtain ⟨out, minOut, hs, hc, hm⟩ := judge_allow_swap c o h hk
  cases hcap : capOf out c.assets with
  | none => rw [hcap] at hc; cases hc
  | some cap => exact ⟨out, minOut, cap, hs, capOf_mem _ _ _ hcap, hm⟩

/-- A decoded context names no venue twice and no asset twice. -/
theorem context_distinct (xs : List UInt8) (c : Context) (h : context xs = some c) :
    distinct c.venues = true ∧ distinct (c.assets.map Prod.fst) = true := by
  unfold context at h
  cases h1 : expect (text "GNKC") xs with
  | none => simp [h1] at h
  | some xs1 =>
    cases h2 : u8 xs1 with
    | none => simp [h1, h2] at h
    | some p2 =>
      obtain ⟨code, xs2⟩ := p2
      cases h3 : actionOf code with
      | none => simp [h1, h2, h3] at h
      | some action =>
        cases h4 : u8 xs2 with
        | none => simp [h1, h2, h3, h4] at h
        | some p4 =>
          obtain ⟨nv, xs4⟩ := p4
          cases h5 : strs nv [] xs4 with
          | none => simp [h1, h2, h3, h4, h5] at h
          | some p5 =>
            obtain ⟨venues, xs5⟩ := p5
            cases h6 : u8 xs5 with
            | none => simp [h1, h2, h3, h4, h5, h6] at h
            | some p6 =>
              obtain ⟨na, xs6⟩ := p6
              cases h7 : capped na [] xs6 with
              | none => simp [h1, h2, h3, h4, h5, h6, h7] at h
              | some p7 =>
                obtain ⟨assets, xs7⟩ := p7
                simp [h1, h2, h3, h4, h5, h6, h7] at h
                obtain ⟨⟨⟨_, hv⟩, ha⟩, rfl⟩ := h
                exact ⟨hv, ha⟩

/-- In a list that names no asset twice, an asset has one cap. -/
theorem distinct_cap (l : List (List UInt8 × Nat)) (hd : distinct (l.map Prod.fst) = true) (a : List UInt8) (x y : Nat)
    (hx : (a, x) ∈ l) (hy : (a, y) ∈ l) : x = y := by
  induction l with
  | nil => simp at hx
  | cons p rest ih =>
    obtain ⟨b, z⟩ := p
    simp only [List.map_cons, distinct, Bool.and_eq_true, Bool.not_eq_true'] at hd
    obtain ⟨hnot, hrest⟩ := hd
    simp only [List.mem_cons, Prod.mk.injEq] at hx hy
    rcases hx with ⟨rfl, rfl⟩ | hx
    · rcases hy with ⟨_, rfl⟩ | hy
      · rfl
      · have hm : a ∈ rest.map Prod.fst := List.mem_map_of_mem hy
        exact absurd (List.contains_iff_mem.mpr hm) (by rw [hnot]; decide)
    · rcases hy with ⟨rfl, rfl⟩ | hy
      · have hm : a ∈ rest.map Prod.fst := List.mem_map_of_mem hx
        exact absurd (List.contains_iff_mem.mpr hm) (by rw [hnot]; decide)
      · exact ih hrest hx hy

/-- Under a decoded context, an allowed order other than an EXIT is within the one cap of its asset: within every cap the
context lists for it. -/
theorem judge_allow_one_cap (xs : List UInt8) (c : Context) (o : Order) (hc : context xs = some c)
    (h : judge c o = Verdict.allow) (hk : o.kind ≠ 4) (cap : Nat) (hm : (o.asset, cap) ∈ c.assets) : o.amount ≤ cap := by
  obtain ⟨cap', hm', hl⟩ := judge_allow_listed c o h hk
  rw [← distinct_cap c.assets (context_distinct xs c hc).2 o.asset cap' cap hm' hm]
  exact hl

/-- The line `allow` is the line of the verdict allow, and of no other. -/
theorem verdictLine_allow (v : Verdict) (h : verdictLine v = verdictLine Verdict.allow) : v = Verdict.allow := by
  cases v with
  | allow => rfl
  | deny why => cases why <;> exact absurd h (by decide)

/-- The verdict on two secs is allow only when they decode to a context and an order that the judge allows. -/
theorem verdictOf_allow (ctx ord : List UInt8) (h : verdictOf ctx ord = Verdict.allow) :
    ∃ c o, context ctx = some c ∧ order ord = some o ∧ judge c o = Verdict.allow := by
  unfold verdictOf at h
  split at h
  · cases h
  · split at h
    · cases h
    · exact ⟨_, _, ‹_›, ‹_›, h⟩

/-- `answer` refuses every request of mode 1: only `respond` judges. -/
theorem answer_mode1 (rest : List UInt8) : answer (text "GNKQ" ++ 1 :: rest) = none := by
  simp only [answer, expect_append]
  simp [u8, beNat]

/-- The answer to an input of mode 1 is its verdict's line when it holds a ctx and an order, and a refusal otherwise. -/
theorem respond_mode1 (rest : List UInt8) :
    respond (text "GNKQ" ++ 1 :: rest) =
      (judgeRequest (text "GNKQ" ++ 1 :: rest)).map (fun p => verdictLine (verdictOf p.1 p.2)) := by
  unfold respond
  split
  · simp_all
  · simp_all [answer_mode1]

/-- A digest has 32 bytes. -/
theorem digestBytes_length (h : Regs) : (digestBytes h).length = 32 := rfl

/-- SHA-256 writes 32 bytes, whatever its input. -/
theorem sha256_length (xs : List UInt8) : (sha256 xs).length = 32 := by
  simp only [sha256]
  exact digestBytes_length _

/-- A line of mode 2 starts with `o` (order) or `i` (invalid): it is never the line `allow`. -/
theorem decodeLine_ne_allow (xs : List UInt8) : decodeLine xs ≠ verdictLine Verdict.allow := by
  intro h
  have hh := congrArg List.head? h
  have ea : (verdictLine Verdict.allow).head? = some 97 := by decide
  rw [ea] at hh
  unfold decodeLine at hh
  split at hh
  · have eo : text "order kind=" = 111 :: text "rder kind=" := by decide
    simp only [orderLine, eo, List.cons_append, List.head?_cons] at hh
    exact absurd hh (by decide)
  · exact absurd hh (by decide)

/-- `answer` never writes the line `allow`: its mode 2 line starts with `o` or `i`, its mode 3 digest has 32 bytes. -/
theorem answer_ne_allow (input : List UInt8) : answer input ≠ some (verdictLine Verdict.allow) := by
  intro h
  unfold answer at h
  cases h1 : expect (text "GNKQ") input with
  | none => simp [h1] at h
  | some xs =>
    cases h2 : u8 xs with
    | none => simp [h1, h2] at h
    | some p =>
      obtain ⟨mode, ys⟩ := p
      cases h3 : lastSec ys with
      | none => simp [h1, h2, h3] at h
      | some body =>
        simp [h1, h2, h3] at h
        split at h
        · exact decodeLine_ne_allow body (Option.some.inj h)
        · split at h
          · have hl := congrArg List.length (Option.some.inj h)
            rw [sha256_length] at hl
            exact absurd hl (by decide)
          · cases h

/-- Whatever the input, when the kernel answers `allow`, the input is a mode 1 request whose ctx and order decode, and the
judge allows that order under that context. -/
theorem respond_allow (input : List UInt8) (h : respond input = some (verdictLine Verdict.allow)) :
    ∃ ctx ord c o, judgeRequest input = some (ctx, ord) ∧
      context ctx = some c ∧ order ord = some o ∧ judge c o = Verdict.allow := by
  unfold respond at h
  split at h
  · rename_i ctx ord hj
    obtain ⟨c, o, hc, ho, hjd⟩ := verdictOf_allow ctx ord (verdictLine_allow _ (Option.some.inj h))
    exact ⟨ctx, ord, c, o, hj, hc, ho, hjd⟩
  · exact absurd h (answer_ne_allow input)

/-- The kernel's `allow`, whatever the input, in one statement: the input is a mode 1 request whose ctx and order decode;
the order is a SWAP, an EXIT or an OPEN on a listed venue; unless it is an EXIT, HIKAE's action is commit and the order
moves a listed asset within its cap, the one cap the context lists for it; a SWAP names a listed assetOut and a minOut
above 0. -/
theorem respond_allow_safe (input : List UInt8) (h : respond input = some (verdictLine Verdict.allow)) :
    ∃ ctx ord c o, judgeRequest input = some (ctx, ord) ∧
      context ctx = some c ∧ order ord = some o ∧
      (o.kind = 3 ∨ o.kind = 4 ∨ o.kind = 5) ∧ o.target ∈ c.venues ∧
      (o.kind ≠ 4 → c.action = Action.commit ∧ (∃ cap, (o.asset, cap) ∈ c.assets) ∧
        ∀ cap, (o.asset, cap) ∈ c.assets → o.amount ≤ cap) ∧
      (o.kind = 3 → ∃ out minOut cap, o.swapOut = some (out, minOut) ∧ (out, cap) ∈ c.assets ∧ 0 < minOut) := by
  obtain ⟨ctx, ord, c, o, hj, hc, ho, hjd⟩ := respond_allow input h
  refine ⟨ctx, ord, c, o, hj, hc, ho, judge_allow_kind c o hjd, judge_allow_venue c o hjd, fun hk => ?_,
    fun hk => judge_allow_swap_listed c o hjd hk⟩
  obtain ⟨cap, hm, _⟩ := judge_allow_listed c o hjd hk
  exact ⟨judge_allow_commit c o hjd hk, ⟨cap, hm⟩, judge_allow_one_cap ctx c o hc hjd hk⟩

/-- The bytes of a sec: its length as a u32, big-endian, then its bytes. -/
def secOf (body : List UInt8) : List UInt8 :=
  [(body.length / 16777216 % 256).toUInt8, (body.length / 65536 % 256).toUInt8, (body.length / 256 % 256).toUInt8,
    (body.length % 256).toUInt8] ++ body

/-- The mode 1 request of a ctx and an order, as `encodeJudgeRequest` of src/frame.ts writes it. -/
def judgeBytes (ctx ord : List UInt8) : List UInt8 := text "GNKQ" ++ 1 :: (secOf ctx ++ secOf ord)

/-- `takeBytes` reads a list of its count off the front. -/
theorem takeBytes_append (acc body rest : List UInt8) :
    takeBytes body.length acc (body ++ rest) = some (acc.reverse ++ body, rest) := by
  induction body generalizing acc with
  | nil => simp [takeBytes]
  | cons b body ih => simp [takeBytes, ih]

/-- `sec` reads back the sec `secOf` writes, for a body of fewer than 2^32 bytes. -/
theorem sec_secOf (body rest : List UInt8) (h : body.length < 4294967296) : sec (secOf body ++ rest) = some (body, rest) := by
  simp only [sec, secOf, u32, beNat, List.cons_append, List.nil_append]
  have e : ((((0 * 256 + (body.length / 16777216 % 256).toUInt8.toNat) * 256 + (body.length / 65536 % 256).toUInt8.toNat) * 256 +
      (body.length / 256 % 256).toUInt8.toNat) * 256 + (body.length % 256).toUInt8.toNat) = body.length := by
    simp
    omega
  rw [e]
  simpa using takeBytes_append [] body rest

/-- The request built from a ctx and an order holds exactly that ctx and that order. -/
theorem judgeRequest_judgeBytes (ctx ord : List UInt8) (hc : ctx.length < 4294967296) (ho : ord.length < 4294967296) :
    judgeRequest (judgeBytes ctx ord) = some (ctx, ord) := by
  simp only [judgeRequest, judgeBytes, expect_append]
  simp [u8, beNat, sec_secOf _ _ hc, lastSec]
  have := sec_secOf ord [] ho
  simp at this
  simp [this]

/-- The answer to the request built from a ctx and an order is the line of the verdict on exactly them. -/
theorem respond_judgeBytes (ctx ord : List UInt8) (hc : ctx.length < 4294967296) (ho : ord.length < 4294967296) :
    respond (judgeBytes ctx ord) = some (verdictLine (verdictOf ctx ord)) := by
  simp [respond, judgeRequest_judgeBytes ctx ord hc ho]

end Genkan
