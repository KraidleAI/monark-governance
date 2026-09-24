import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// AttestedBook (ADR-U1b) honesty + subject oracles — the two NON-ajv gel tests (the ajv-executed ones
// live in schema.test.ts, the enum-drift ones in enums.test.ts, the closed-check in closed-check.test.ts).
// Zero-dep, typed schema view (no `any`, so lint-ratchet stays put).

const schemasDir = new URL("../../../schemas/", import.meta.url);
/** Minimal structural view of the JSON-Schema nodes these tests read. Recursive. */
type SchemaNode = {
  description?: string;
  properties?: Record<string, SchemaNode>;
  pattern?: string;
};
function loadSchema(name: string): SchemaNode {
  return JSON.parse(readFileSync(new URL(name, schemasDir), "utf8")) as SchemaNode;
}

// The description DISCLAIMS verification; it must make NO positive probative claim (ADR-U1b D3, C-8). This
// re-uses the PROBATIVE scrub of apps/harness/test/attest.test.ts:109 (the real \b-bounded regex, NOT the
// ADR's shorthand `/live|verified|.../i`), applied AFTER masking the two NAMED honest negations of D3.
// Mutant (e): insert a bare `verified` into the description ⇒ it survives the scope-locked mask ⇒ red.
test("attested_book_description_no_probative_claim", () => {
  const desc = loadSchema("attested-book.schema.json").description ?? "";
  assert.ok(desc.length > 0, "the schema must carry a frozen description");

  const PROBATIVE = /\blive\b|\bverified\b|\bprobative\b|\bp_correct\b|\bconfidence\b/i;
  const scrub = (s: string): string =>
    s
      .replace(/no third-party verification/gi, (m) => " ".repeat(m.length))
      .replace(/No verifier runs/gi, (m) => " ".repeat(m.length));

  // non-vacuous: the two named negations are actually present (so the mask is scoped to real spans).
  assert.ok(desc.includes("no third-party verification"), "the 'no third-party verification' disclaimer must be present");
  assert.ok(desc.includes("No verifier runs"), "the 'No verifier runs' disclaimer must be present");

  // after masking exactly those two negations, NO probative token may survive.
  assert.ok(!PROBATIVE.test(scrub(desc)), `description makes no probative claim (scrubbed: "${scrub(desc)}")`);

  // positive honesty anchors (non-vacuous): the description names the self-declared, verifier-less nature.
  assert.ok(desc.includes("Self-declared"), "declares the reading is self-declared");
  assert.ok(desc.includes("no price is carried"), "declares no price is carried");

  // scope-locked proof: a bare probative token OUTSIDE the two sanctioned negations survives the mask ⇒ caught.
  assert.ok(PROBATIVE.test(scrub("this book is verified now " + desc)), "a bare probative token must not be masked");
});

// The frozen `subject` pattern is a NAMED APPROXIMATION of subject.rs C1-C10 (ADR-U1b D2bis, non-port
// declared for C3-IPv4 and C6 dot-segments). The emitted subjects are a SUBSET of the strict canonical
// motif M017 (NOT frozen; the host is committed HERE as the fixed-list oracle — no Shogen verdict fixture
// exists in this repo). This test asserts BOTH faces so it never over-claims "C1-C10 enforced by schema".
test("subject_pattern_subset_of_canonical", () => {
  const ab = loadSchema("attested-book.schema.json");
  const pattern = ab.properties?.subject?.pattern ?? "";
  assert.ok(pattern.length > 0, "the schema must carry the subject pattern");
  const SCHEMA_SUBJECT = new RegExp(pattern);

  // The STRICT canonical motif (ADR-U1b D2bis / M017 D5): host PINNED, cluster + block strict.
  const CANONICAL = /^https:\/\/monarkgate\.tech\/ukemi\/book\/[a-z0-9-]+\/[0-9]+\.json$/;

  const canonicalValid = [
    "https://monarkgate.tech/ukemi/book/weth/23545087.json",
    "https://monarkgate.tech/ukemi/book/susde-usde/23545087.json",
    "https://monarkgate.tech/ukemi/book/weth/0.json",
  ];
  // emitted (canonical) subjects ⊂ schema-accepted AND ⊂ the strict motif.
  for (const s of canonicalValid) {
    assert.ok(CANONICAL.test(s), `canonical subject must match the strict M017 motif: ${s}`);
    assert.ok(SCHEMA_SUBJECT.test(s), `canonical subject must be accepted by the frozen schema pattern: ${s}`);
  }

  // The five dangerous forms the recorder must never emit — ALL rejected by the strict motif.
  const dangerous: ReadonlyArray<readonly [string, string]> = [
    ["MAJ host", "https://Monarkgate.tech/ukemi/book/weth/1.json"],
    ["userinfo @", "https://u@monarkgate.tech/ukemi/book/weth/1.json"],
    ["fragment #", "https://monarkgate.tech/ukemi/book/weth/1.json#f"],
    ["dot-segment ..", "https://monarkgate.tech/ukemi/book/../1.json"],
    ["IPv4 literal host", "https://127.0.0.1/ukemi/book/weth/1.json"],
  ];
  for (const [why, s] of dangerous) {
    assert.ok(!CANONICAL.test(s), `strict M017 motif must reject ${why}: ${s}`);
  }

  // The frozen schema pattern catches C2/C4/C9 (MAJ host, @, #) on its own...
  assert.ok(!SCHEMA_SUBJECT.test("https://Monarkgate.tech/ukemi/book/weth/1.json"), "schema rejects a MAJ host (C2/C3)");
  assert.ok(!SCHEMA_SUBJECT.test("https://u@monarkgate.tech/ukemi/book/weth/1.json"), "schema rejects userinfo @ (C4)");
  assert.ok(!SCHEMA_SUBJECT.test("https://monarkgate.tech/ukemi/book/weth/1.json#f"), "schema rejects a fragment # (C9)");
  // ...but DECLARES C6 dot-segments and C3-IPv4 as NON-PORTS: the loose schema ACCEPTS them; only the
  // strict motif / recorder gabarit rejects them. Asserting the acceptance keeps the approximation honest.
  assert.ok(SCHEMA_SUBJECT.test("https://monarkgate.tech/ukemi/book/../1.json"), "schema ACCEPTS a dot-segment (C6 non-port, D2bis)");
  assert.ok(SCHEMA_SUBJECT.test("https://127.0.0.1/ukemi/book/weth/1.json"), "schema ACCEPTS an IPv4 host (C3-IPv4 non-port, D2bis)");
});
