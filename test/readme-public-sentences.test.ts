/**
 * Root test of the public sentences that the public-sentences core bounds in README.md, in the published skill, in the
 * exported sentinel README and in the positioning lines of the site: each test pins one
 * bounded sentence, or one family of them, to the code that makes it true today (its "premise" assertion) and names, in
 * its title, the limit and the item that will make the old wording true again. When that item lands, the premise reds and
 * the sentence is revisited; until then the old wording reds. README.md, the skill and the sentinel README are exported to
 * the public mirror; this file is not. A sentence of a site page is read as the page renders it (the honesty-lint walker:
 * JSX text, JSX child literals, visible attributes; a JSX comment is not rendered) or from its exported metadata, never
 * from the source text. Node built-ins, typescript, the register and the export lists.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { renderedTexts } from "../apps/site/test/honesty-lint.ts";
import { COUNT_WORDS, PRODUCTS, SHARED_GATE, upcomingProducts } from "../apps/site/lib/fleet.ts";
import { APP_PACKAGE_DIRS, WHITELIST_DIRS, WHITELIST_FILES } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");
const readme = read("README.md").split(/\r?\n/);
/** The lines of one "## " section of the README, its heading excluded. */
const section = (title: string): string[] => {
  const start = readme.indexOf("## " + title);
  assert.ok(start >= 0, "README section ## " + title + " not found");
  const end = readme.findIndex((l, i) => i > start && l.startsWith("## "));
  return readme.slice(start + 1, end < 0 ? readme.length : end);
};
/** The rendered text of a site source, white space collapsed: its JSX text, JSX child literals and visible attributes. */
const rendered = (rel: string): string =>
  renderedTexts(ts.createSourceFile(rel, read(rel), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)).map((t) => t.text).join(" ").replace(/\s+/g, " ");
/** The description of a page's exported metadata, a string or the static parts of a template, as the page serves it. */
const metadataDescription = (rel: string): string => {
  const sf = ts.createSourceFile(rel, read(rel), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt) || !(stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false)) continue;
    const init = stmt.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === "metadata")?.initializer;
    const prop = init !== undefined && ts.isObjectLiteralExpression(init) ? init.properties.find((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === "description") : undefined;
    const value = prop !== undefined && ts.isPropertyAssignment(prop) ? prop.initializer : undefined;
    if (value !== undefined && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))) return value.text;
    if (value !== undefined && ts.isTemplateExpression(value)) return [value.head.text, ...value.templateSpans.map((span) => span.literal.text)].join(" ");
  }
  return "";
};
/** The .ts files under a directory of the repository, at any depth, as repository paths. */
const tsUnder = (dir: string): string[] => (readdirSync(join(ROOT, ...dir.split("/")), { recursive: true }) as string[]).filter((f) => f.endsWith(".ts")).map((f) => dir + "/" + f.split("\\").join("/"));
/** The src/ directories of the apps or packages that have one. */
const srcDirs = (root: string): string[] => readdirSync(join(ROOT, root)).map((d) => root + "/" + d + "/src").filter((d) => existsSync(join(ROOT, ...d.split("/"))));
/** Whether an export root (a whitelisted file or directory, or an app exported package-style) carries the Bell collector. */
const collectorExported = (): boolean =>
  [...WHITELIST_FILES, ...WHITELIST_DIRS, ...APP_PACKAGE_DIRS].some((p) => "apps/bell/src/collect.ts".startsWith(p + "/") || p.startsWith("apps/bell/src"));

// killer: README.md:61 CONST "machine-readable without an account:" -> "machine-readable, and replayable by a third party without an account:"
test("readme_served_table_lead_claims_nothing_for_every_row — the lead of the served table no longer says every surface is replayable by a third party; each row's consumer column speaks for it (Narabi L19; NARABI-POW-PORTABLE-1)", () => {
  assert.ok(read("packages/hikae/src/tracker.ts").includes("base ** (-1 / 2 - params.eps)") && read("apps/sentinel/src/run.ts").includes("interface Provenance { readonly endpoints: readonly string[]; readonly node_version: string; readonly sentinel_sha: string; }"), "premise: the tracker replay depends on the engine's pow and a line records no platform; when NARABI-POW-PORTABLE-1 lands this reds and the lead is revisited");
  const lead = section("What is served today").find((l) => l.startsWith("Everything below")) ?? "";
  assert.ok(lead.length > 0, "the lead of the served table");
  assert.doesNotMatch(lead, /replayable by a third party/, "not every surface is replayable by a third party");
  assert.equal(lead, "Everything below is live and machine-readable without an account:", "the lead claims nothing beyond live and machine-readable");
});

// killer: README.md:175 CONST "eight today; a ninth" -> "six today; a seventh"
test("readme_counts_the_frozen_contracts — the maturity criterion counts the schemas/*.schema.json files, in words (PX-Harness-02, MK-L36; README-CONTRACT-COUNT-1)", () => {
  const n = readdirSync(join(ROOT, "schemas")).filter((f) => f.endsWith(".schema.json")).length;
  const ORDINALS = ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth"];
  const criterion = readme.find((l) => l.startsWith("2. **A frozen contract**")) ?? "";
  assert.ok(criterion.includes("(" + (COUNT_WORDS[n] ?? "?") + " today; a " + (ORDINALS[n + 1] ?? "?") + " is a versioned change"), "the criterion counts " + String(n) + " frozen contracts: " + criterion);
});

// killer: README.md:258 CONST "HTTP 400 answer" -> "HTTP 400 or 500 answer"
test("readme_tool_error_row_says_the_500_bodies — a 500 answer carries no message: the mirror's carries its operation, a transport-level one its error alone (PX-Harness-03 (a); TRANSPORT-ERROR-DEF-1 describes the transport 500 in the contract)", () => {
  const schema = JSON.parse(read("schemas/tool-error.schema.json")) as { description: string; $defs: { InternalError: { required: string[]; properties: Record<string, unknown> } } };
  assert.ok(!("message" in schema.$defs.InternalError.properties) && schema.$defs.InternalError.required.includes("operation"), "premise: the frozen 500 body of the mirror has an operation and no message");
  assert.ok(schema.description.includes("a transport-level 500 without operation"), "premise: the contract leaves the transport 500 undescribed; when TRANSPORT-ERROR-DEF-1 describes it this reds and the row is revisited");
  const row = readme.find((l) => l.startsWith("| `ToolError` |")) ?? "";
  assert.doesNotMatch(row, /400 or 500 answer/, "the 400 shape is not said of the 500 answer");
  assert.match(row, /A 500 answer is `internal_error` and carries no `message`: the mirror's carries its `operation` \(`\$defs\/InternalError`\), a transport-level one carries `error` alone\./, "the row says both 500 bodies");
});

// killer: README.md:55 CONST "(for Narabi today, a drift flag its sentinel publishes per line, with no other effect yet; " -> "(a drift criterion, "
test("readme_kept_adapted_names_the_drift_flag_and_its_effect — the paragraph names the flag the Narabi sentinel publishes, with no other effect, instead of a general drift criterion (Hikae L10; PXC-10, CM-5-PLAN-1)", () => {
  const readers = [...tsUnder("apps/harness/src"), ...srcDirs("packages").flatMap((d) => tsUnder(d))].filter((f) => read(f).includes("drift_flag"));
  assert.deepEqual(readers, [], "premise: no gate or package module reads the drift flag (the sentinel writes it, the site shows it); when one does this reds and the paragraph is revisited");
  const start = readme.findIndex((l) => l.startsWith("**Kept adapted.**"));
  assert.ok(start >= 0, "the Kept adapted paragraph");
  const para = readme.slice(start, readme.indexOf("", start)).join(" ");
  assert.doesNotMatch(para, /\(a drift criterion,/, "no general drift criterion");
  assert.match(para, /a drift flag its sentinel publishes per line, with no other effect yet/, "the flag and its effect");
});

// killer: README.md:107 CONST "an RPC quorum that counts keyless operators and an optional keyed one, and digests it" -> "a keyless RPC quorum and digests it"
test("readme_says_the_recorder_quorum_counts_its_keyed_operator — every README line on the recorder's quorum says it counts keyless operators and the optional keyed one the recorder appends (Ukemi N3; PX-Ukemi-20)", () => {
  assert.match(read("apps/sentinel/src/ukemi/record.ts"), /\.\.\.\(csRequested \? \["[a-z]+"\] : \[\]\)/, "premise: the recorder appends one keyed operator when asked; when it stops this reds and the README is revisited");
  const lines = readme.filter((l) => /keyless/i.test(l));
  assert.ok(lines.length >= 3, "the recorder, the study and the contract lines");
  for (const l of lines) assert.match(l, /an RPC quorum that counts keyless operators and an optional keyed one/, l);
  assert.ok(!readme.some((l) => /keyless RPC quorum/.test(l)), "no bare keyless quorum");
});

// killer: README.md:137 CONST "is not in the public export yet, so the digest cannot be rebuilt from the pools." -> "so rebuild the digest from the declared pools."
test("readme_bell_is_checked_not_rebuilt_while_its_collector_is_outside_the_export — no digest rebuilt from the pools, no timeline called replayable for every piece, the reader's verifier named, while the export leaves the collector out (Bell N-07; BELL-README-REPLAY-1; Bell L-31 makes the old words true again)", () => {
  assert.ok(!collectorExported(), "premise: no export root (file, directory or package) carries the collector; when one does this reds and the README may say rebuild");
  const text = readme.join("\n");
  assert.doesNotMatch(text, /rebuild the digest from the declared pools/, "the digest is not rebuilt from the pools by a third party");
  assert.doesNotMatch(text, /replayable\s+timelines/, "no timeline is called replayable for every served piece");
  assert.ok(readme.includes("**Check them yourself.** Narabi: recompute every window from its `[from_block, to_block]` via"), "the paragraph is a check, not a replay");
  assert.match(text, /the collector\nthat reads the declared pools is not in the public export yet, so the digest cannot be rebuilt from the pools\./, "the README says why");
  assert.equal((text.match(/`apps\/bell\/scripts\/bell-verify\.mjs`/g) ?? []).length, 2, "both Bell paragraphs name the reader's verifier");
});

// killer: README.md:214 CONST "Each research lead is wired to the same gate, while MONARK Bell keeps its own;" -> "Every application plugs into the same gate;"
test("readme_and_site_say_the_engine_is_meant_to_power_the_applications — the README and the site say the engine is meant to power the on-chain applications and MONARK Bell keeps its own gate, never that the engine powers them, Bell first, or that every application plugs into the same gate, while MONARK Bell imports neither the gate nor the contracts (Bell N-02; BELL-CONNECTS-WITNESS-1)", () => {
  const deps = Object.keys((JSON.parse(read("apps/bell/package.json")) as { dependencies?: Record<string, string> }).dependencies ?? {});
  assert.ok(!deps.some((d) => ["@monark/contracts", "@monark/harness", "@monark/hikae"].includes(d)), "premise: MONARK Bell imports neither the contracts nor the gate; when it does this reds and the positioning is revisited");
  assert.ok(upcomingProducts().every((p) => p.wiring.gate === SHARED_GATE), "premise: every research lead is wired to the shared gate in the register");
  const text = readme.join("\n");
  assert.doesNotMatch(text, /derived from the same gate|Every application plugs into the same gate/, "no application said derived from, or plugged into, the same gate");
  assert.match(text, /MONARK Bell, the one built today, keeps its own gate and imports none of the frozen contracts/, "Bell's gate and contracts");
  assert.match(text, /Each research lead is wired to the same gate, while MONARK Bell keeps its own/, "the shared gate is said of the research leads");
  const POWERS = /applications (?:it|the (?:MONARK )?engine) powers|(?<!meant to be )powered by the engine|The engine powers|application of the engine|MONARK Bell first|The first is MONARK Bell|Everything in MONARK plugs/;
  const SURFACES = ["README.md", "apps/site/app/layout.tsx", "apps/site/app/page.tsx", "apps/site/app/roadmap/page.tsx", "apps/site/app/docs/page.tsx", "apps/site/app/docs/bell/page.tsx", "apps/site/app/applications/page.tsx", "apps/site/components/site-header.tsx"];
  for (const rel of SURFACES) assert.doesNotMatch(read(rel).replace(/\s+/g, " "), POWERS, rel + " says the engine powers the applications");
  // A refusal list cannot name every paraphrase ("the on-chain applications that run on it"): the whole sentence of each
  // surface is pinned word for word, the README by its lines, a site page as it renders or as its metadata serves it. The
  // site header renders its nav labels alone; its "meant to power" is a source comment, so it carries no positive pin.
  const README_LINES = [
    "The blades are the DeFi side: the **on-chain applications it is meant to power**, each one grown from an empirical",
    "**Right:** what it gives the DeFi side — the on-chain applications it is meant to power (in parentheses: the applications",
    "| DeFi | **Applications** — meant to be powered by the engine | one application per DeFi need, meant to be served with its own published artefacts | **1 built** (MONARK Bell, its own gate) · **5 research leads** |",
    "                                        │  meant to power",
  ];
  for (const line of README_LINES) assert.ok(readme.includes(line), "the README keeps its line, word for word: " + line.trim());
  const SAID: [string, string][] = [
    [metadataDescription("apps/site/app/layout.tsx"), "MONARK — two sides, one engine. AI side: a coverage-controlled gate that emits commit, defer, or abstain over a depletable budget. DeFi side: the on-chain applications it is meant to power; the first, MONARK Bell, keeps its own gate."],
    [rendered("apps/site/app/page.tsx"), "The DeFi side is the on-chain applications it is meant to power."],
    [rendered("apps/site/app/page.tsx"), "The engine is meant to power the on-chain applications; there is one token and one ticker."],
    [rendered("apps/site/app/roadmap/page.tsx"), "MONARK is one engine and the on-chain applications it is meant to power."],
    [rendered("apps/site/app/docs/page.tsx"), "MONARK is a coverage-controlled decision gate, the pieces that read and act around it, and the on-chain applications it is meant to power."],
    [rendered("apps/site/app/docs/page.tsx"), "The blades are the DeFi side: the on-chain applications the engine is meant to power, each grown from a study of on-chain data before it is served."],
    [metadataDescription("apps/site/app/applications/page.tsx"), "The on-chain applications the MONARK engine is meant to power, by the profile that needs them, and the artefacts sold to a named buyer."],
    [rendered("apps/site/app/applications/page.tsx"), "The on-chain applications the engine is meant to power, by the profile that needs them."],
    [rendered("apps/site/app/applications/page.tsx"), "A client is meant to install one visible piece &mdash; the act that matches their need &mdash; while the sensors and the gate stay behind it."],
    [rendered("apps/site/app/docs/bell/page.tsx"), "MONARK Bell is an application on the DeFi side, with its own gate:"],
  ];
  for (const [served, sentence] of SAID) assert.ok(served.includes(sentence), "the site serves its sentence, word for word: " + sentence);
  assert.match(text, /The first built is MONARK Bell, which keeps its own gate/, "the README lede says Bell keeps its own gate");
  assert.match(text, /\*\*1 built\*\* \(MONARK Bell, its own gate\)/, "the README table says Bell keeps its own gate");
  assert.ok(section("The interlocking (why the pieces work together)").some((l) => l.endsWith("│  meant to power")) && text.includes("MONARK Bell (built, served, its own gate)"), "the diagram draws the engine meant to power the applications, Bell with its own gate");
});

// killer: README.md:205 CONST "sensors (attest · join building)" -> "sensors (attest)"
test("readme_shogen_row_and_diagram_say_the_join_is_being_built — no price an application can defend, one committed witness projected today, and the attest join drawn building while the served gate refuses every attested (Shōgen L-01, N-14; the seam is PXC-08)", () => {
  assert.ok(read("apps/harness/src/attestation-binding.ts").includes("so any `attested` is refused"), "premise: the join does not run yet; when the seam is served this reds and the README is revisited");
  assert.ok(read("apps/harness/src/tools/registry.ts").includes("No caller input: the witness is the committed internal fixture"), "premise: the attest tool projects one committed witness; when it takes a caller's price this reds and the row is revisited");
  const row = readme.find((l) => l.includes("| **Shōgen** — sensor")) ?? "";
  assert.doesNotMatch(row, /can defend/, "the testimony attests origin and bytes, not a price to defend");
  assert.match(row, /today the attest tool projects one committed witness, and its join into the gate is being built/, "the row says the witness and the join being built");
  const diagram = section("The interlocking (why the pieces work together)");
  assert.ok(diagram.some((l) => l.includes("sensors (attest · join building)  →  the gate")), "the diagram draws the attest join building");
  assert.ok(!diagram.some((l) => l.includes("sensors (attest)  →")), "no attest arrow drawn as built");
});

// killer: README.md:186 CONST "the onchain redemption flow of a stablecoin" -> "attested redemption flow of a stablecoin"
test("readme_narabi_words_claim_no_attested_flow — the README calls Narabi's flow neither attested nor its record an attestation while the sentinel declares a placeholder attestor key (Narabi L15; NARABI-K1 makes the old words true again)", () => {
  assert.ok(read("apps/sentinel/src/flow.ts").includes('key: "deadbeef"'), "premise: the attestor key is a placeholder; when NARABI-K1 replaces it this reds and the README is revisited");
  const text = readme.join("\n");
  assert.doesNotMatch(text, /attested redemption flow|attested daily USDe|`AttestedFlow` attestation|An \*\*attested\*\* testimony of redemption flow/, "no Narabi line says attested");
  assert.match(text, /\| `AttestedFlow` \| Narabi \| A testimony of redemption flow, its attestation upcoming/, "the contract row says the attestation is upcoming");
  assert.match(text, /- \*\*Narabi\*\* — the onchain redemption flow of a stablecoin, read at block finality/, "the study line names the flow it reads");
});

// killer: README.md:232 CONST "then follow the `prev_line_hash` chain of `timeline.jsonl`; each line records the Node version that wrote it." -> "then re-derive `q` with the committed `trackerReplay` over the `s` column of `timeline.jsonl`."
test("readme_narabi_promises_no_tracker_replay — no README line calls Narabi's timeline replayable or asks to rederive q; both recipes say the hash chain and the Node version each line records (Narabi L19; NARABI-POW-PORTABLE-1 makes a bounded replay true)", () => {
  assert.ok(read("packages/hikae/src/tracker.ts").includes("base ** (-1 / 2 - params.eps)") && read("apps/sentinel/src/run.ts").includes("interface Provenance { readonly endpoints: readonly string[]; readonly node_version: string; readonly sentinel_sha: string; }"), "premise: the step uses the engine's pow and a line records no platform; when NARABI-POW-PORTABLE-1 lands this reds and the recipes are revisited");
  const text = readme.join("\n");
  assert.doesNotMatch(text, /\breplayable\b|\breplaying the tracker\b|re-derive `q`/i, "no README line promises a replay of the tracker");
  assert.ok(text.includes("each line of `timeline.jsonl` is hash-chained and records the Node version\nthat wrote it."), "the first recipe says the hash chain and the Node version");
  assert.ok(readme.includes("  then follow the `prev_line_hash` chain of `timeline.jsonl`; each line records the Node version that wrote it."), "the second recipe says the hash chain and the Node version");
  assert.ok(readme.some((l) => l.includes("| Anyone checking the windows and the hash chain; the site's `/narabi` page |")), "the consumer of the timeline checks it and does not replay it");
});

// killer: README.md:35 CONST "Will read the deleveraging queue" -> "Reads the deleveraging queue"
test("readme_cascade_and_deleveraging_say_what_runs — the cascade rows say the interbank shock tool that is served, and the deleveraging reader is said in the future while no code reads a queue or a position (Ukemi E8, E12; UKEMI-CASCADE-TEXT-1, UKEMI-READER-TEXT-1)", () => {
  assert.ok(read("apps/harness/src/tools/cascade.ts").includes("an Eisenberg-Noe clearing of the interbank system"), "premise: the served cascade clears a caller-carried interbank system; when it reads a lending book this reds and the rows are revisited");
  const readers = [...srcDirs("apps"), ...srcDirs("packages")].flatMap((d) => tsUnder(d)).filter((f) => /deleverag/i.test(read(f)));
  assert.deepEqual(readers, [], "premise: no source module reads a deleveraging queue; when one does this reds and the rows may say reads");
  const row = readme.find((l) => l.includes("| **Ukemi** — act")) ?? "";
  assert.doesNotMatch(row, /what a lending book would liquidate along a price path/, "the cascade cell does not say a lending book");
  assert.match(row, /\| Will read the deleveraging queue or the position before it clears \(wired: Firebreak, Softlanding\)\. \|$/, "the DeFi cell is in the future");
  assert.ok(!readme.join("\n").includes("`cascade` for a lending\n"), "the builder step does not say a lending position");
  for (const key of ["firebreak", "softlanding"]) assert.match(PRODUCTS.find((p) => p.key === key)?.wiring.sensor ?? "", /^Ukemi will read /, key + ": the register wiring is in the future");
});

// killer: skills/monark/SKILL.md:68 CONST "on the 24h redemption flow" -> "on the attested 24h flow"
test("skill_and_sentinel_readme_claim_no_attested_flow_and_no_replay — the published skill and the exported sentinel README call the flow neither attested nor attested onchain, and the timeline hash-chained, never replayable, while the attestor key is a placeholder and the tracker step rests on the engine's pow (Narabi L15, L19, T2; NARABI-K1, NARABI-POW-PORTABLE-1)", () => {
  assert.ok(read("apps/sentinel/src/flow.ts").includes('key: "deadbeef"'), "premise: the attestor key is a placeholder; when NARABI-K1 replaces it this reds and the texts are revisited");
  assert.ok(read("packages/hikae/src/tracker.ts").includes("base ** (-1 / 2 - params.eps)") && read("apps/sentinel/src/run.ts").includes("interface Provenance { readonly endpoints: readonly string[]; readonly node_version: string; readonly sentinel_sha: string; }"), "premise: the step uses the engine's pow and a line records no platform; when NARABI-POW-PORTABLE-1 lands this reds and the texts are revisited");
  const ATTESTED = /\battested\s+(?:24h|onchain|redemption|daily|flow)\b/i;
  const REBUILT = /\breplayable\b|\breplaying the tracker\b|re-derive the tracker|anyone can (?:replay|rebuild)/i;
  for (const claim of [
    "Narabi reads the attested redemption flow of USDe, and anyone can rebuild its tracker state from the timeline.",
    "Narabi reads the attested redemption flow and publishes a daily timeline anyone can rebuild the tracker from.",
  ]) assert.ok(ATTESTED.test(claim) && REBUILT.test(claim), "positive control, both refusals read the false claim: " + claim);
  for (const rel of ["skills/monark/SKILL.md", "skills/monark/DEMO.md", "skills/monark/INTEGRATION.md", "apps/sentinel/README.md"]) {
    assert.doesNotMatch(read(rel), ATTESTED, rel + " calls the flow attested");
    assert.doesNotMatch(read(rel), REBUILT, rel + " calls the timeline replayable or promises a rebuild of the tracker");
  }
  assert.ok(read("skills/monark/SKILL.md").includes("steps an adaptive quantile tracker on the 24h redemption flow and"), "the skill names the flow it reads");
  assert.ok(read("skills/monark/SKILL.md").includes("publishes a hash-chained timeline (`state.json`, `timeline.jsonl`) at"), "the skill says the timeline is hash-chained");
});

// killer: apps/site/app/bell/method/page.tsx:605 CONST "restates (that source is not in the public export yet)," -> "restates,"
test("bell_method_says_the_collector_revision_is_outside_the_export — /bell/method, as it renders, says the collector revision it restates is not in the public export while no export root carries the collector; publishing the fingerprint of the collector tree makes the clause revisited", () => {
  assert.ok(!collectorExported(), "premise: no export root (file, directory or package) carries the collector; when one does this reds and the page is revisited");
  assert.ok(rendered("apps/site/app/bell/method/page.tsx").includes(", the date of the collector source revision it restates (that source is not in the public export yet),"), "the page says where the revision is not");
});
