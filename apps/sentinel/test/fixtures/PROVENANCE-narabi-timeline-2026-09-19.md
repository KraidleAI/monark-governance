# PROVENANCE — `narabi-timeline-2026-09-19.jsonl` (Narabi published-timeline fixture, lot NARABI-OPS-1)

Traceable origin + file pin for `apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl`, the
three-line capture of the live published timeline read by `apps/sentinel/test/sentinel-retry.test.ts`
(the offline retry / exit-code replay of the 2026-09-20 ops incident). English by ADR-M003 D0.5.

- **Source**: a single `curl https://monarkgate.tech/narabi/timeline.jsonl` on 2026-09-20 (public,
  read-only, no key — the exact served file the site parses). Captured at G1 of lot NARABI-OPS-1 because
  the 2026-09-19 window (`T=2`) is absent from the committed `apps/site/lib/narabi-snapshot.ts` (that
  snapshot stops at 2026-09-18). Lines 1-2 are byte-identical to the snapshot; line 3 chains onto it
  (its `prev_line_hash` is the 2026-09-18 `line_hash` `ec4ce67e716e89811cb1707b28b7cfed96e8fa35ce4d54c178eb30aa83deec0a`).
- **Role**: the oracle for L-4. Replaying line 3's facts through the real `attest` + `step` reproduces
  every hashed field and its `line_hash` `f73c700642b394c46ede6c930cff3186f516a9447190a16a57010bb10ad55b2c`
  (measured at G1). `endpoints` / `node_version` / `sentinel_sha` are outside `hashedFields`, so the
  capture reproduces under any provenance; no raw RPC payload is needed (`attest` / `step` are pure).
- **Integrity**: `.gitattributes` normalizes to `eol=lf`; the root test `series_pinned_are_declared_and_hashed`
  LF-normalizes before hashing.
- **sha256 (LF)** of `narabi-timeline-2026-09-19.jsonl`: `51716581a3a597162bda431c5d57c1a86f0ee2faef1dfaaef643cc3be1aad951`
