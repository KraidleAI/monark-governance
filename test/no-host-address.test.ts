/**
 * Root test of the address-literal gate (founder decision of 2026-10-07; docs/G0-lot-host-address-gate.md): no tracked text file
 * carries an IPv4 or IPv6 literal outside the closed list of scripts/address-literals.mjs (the EXEMPT ranges, the LISTED pairs).
 * A hit prints as path:line:column and a mask, never the literal: a CI log of a public repository is public. The fixtures are
 * throwaway git repositories under os.tmpdir() (index only, every GIT_* variable removed, no system or global config), and each
 * refused address is built at run time from its parts (q, six), so this file needs no entry of its own. The samples come from
 * ranges that name no host on the internet: benchmarking (RFC 2544, RFC 5180) and shared address space (RFC 6598). The line above
 * each test is the mutation of the script that reddens it (killer convention of scripts/red-proof.mjs).
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { LISTED, SELF, literals, mask, report, scan, stale, type Verdict } from "../scripts/address-literals.mjs";

const REPO = join(import.meta.dirname, "..");
/** A literal from its parts: the source of this file never spells one outside the exempt ranges. */
const q = (...o: number[]): string => o.join(".");
const six = (...g: string[]): string => g.join(":");
const A = q(198, 18, 0, 7), C = q(100, 64, 0, 9), B = six("2001", "2", "", "7");
const TMP: string[] = [];
after(() => { for (const d of TMP) rmSync(d, { recursive: true, force: true, maxRetries: 3 }); });

/** A throwaway repository: `tracked` files are written then added (ls-files reads the index), `loose` ones are only written. */
function fixture(tracked: Record<string, string | Buffer>, loose: Record<string, string> = {}, afterAdd: (root: string, env: NodeJS.ProcessEnv) => void = () => undefined): Verdict {
  const base = mkdtempSync(join(tmpdir(), "address-literals-"));
  TMP.push(base);
  const root = join(base, "repo");
  writeFileSync(join(base, "gitconfig"), "");
  const env: NodeJS.ProcessEnv = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))),
    GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(base, "gitconfig") };
  mkdirSync(root);
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root, env });
  for (const [rel, body] of Object.entries({ ...tracked, ...loose })) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
  execFileSync("git", ["add", "--", ...Object.keys(tracked)], { cwd: root, env });
  afterAdd(root, env);
  return scan(root, env);
}
const at = (v: Verdict, file: string): string[] => v.hits.filter((h) => h.file === file).map((h) => `${String(h.line)}:${String(h.col)} ${String(h.kind)} ${h.mask}`);

// The tracked tree, red on the base eb1beb01 (the two host addresses in 35 files, and the other literals), green once they are gone;
// each file it skips for a NUL byte is a binary that .gitattributes declares (red until *.jpg was declared: out/banner.jpg).
// killer: scripts/address-literals.mjs:18 SDL "EXEMPT.addSubnet(\"127.0.0.0\", 8, \"ipv4\");" -> ""
test("address_literals_tracked_tree_is_clean", () => {
  const v = scan(REPO);
  assert.ok(v.read > 1000, `implausibly few tracked text files read (${String(v.read)})`);
  assert.deepEqual(stale(v), [], "a listed literal that its file no longer carries: the entry leaves LISTED");
  assert.equal(v.hits.length, 0, report(v));
  assert.deepEqual(v.undeclared, [], "a tracked file with a NUL byte that .gitattributes does not declare binary: the gate never reads it");
});

// reddened by: a label cut only when it is a lone colon, so a word that ends with a hex digit hides the address glued after it
// killer: scripts/address-literals.mjs:82 CONST "/^[^:]*:(?!:)/" -> "/^:(?!:)/"
test("address_literals_refuse_an_address_in_each_writing_met", () => {
  const v = fixture({ "deploy/x.service": [`ssh -i ~/.ssh/k root@${A} 'id'`, `# dedicated host (${A}, decision 57)`, `"remote_ip": "${A}",`,
    `${A}:443 and ${C}/24.`, `https://[${B}]:8443/x`, `addr:${B} inet6:${B}.`, `${six("", "", "ffff")}:${A}`, `${six("fe80", "", "1")}%eth0`].join("\n") });
  assert.deepEqual(at(v, "deploy/x.service"), ["1:22 4 x.x.x.x", "2:19 4 x.x.x.x", "3:15 4 x.x.x.x", "4:1 4 x.x.x.x", "4:20 4 x.x.x.x",
    "5:10 6 x:x::x", "6:6 6 x:x::x", "6:22 6 x:x::x", "7:8 4 x.x.x.x", "7:1 6 ::x:x.x.x.x", "8:1 6 x::x"], "one hit per address, at its column");
});

// reddened by: a documentation range one bit wider (192.0.2.0/23 takes in its upper neighbour)
// killer: scripts/address-literals.mjs:22 CONST "\"192.0.2.0\", 24," -> "\"192.0.2.0\", 23,"
test("address_literals_admit_the_closed_ranges_in_any_writing_and_refuse_their_neighbours", () => {
  const inside = ["127.0.0.1", "127.255.255.255", "0.0.0.0", "::1", "a :: b", "0:0:0:0:0:0:0:1", "::ffff:127.0.0.1", "::ffff:7f00:1", "192.0.2.0",
    "192.0.2.255", "198.51.100.0", "198.51.100.255", "203.0.113.0", "203.0.113.255", "2001:db8::", "2001:DB8:ffff::1", "::ffff:192.0.2.1"];
  const outside = [q(126, 255, 255, 255), q(128, 0, 0, 0), q(0, 0, 0, 1), q(192, 0, 1, 255), q(192, 0, 3, 0), q(198, 51, 99, 255), q(198, 51, 101, 0),
    q(203, 0, 112, 255), q(203, 0, 114, 0), six("", "", "2"), six("2001", "db7", "ffff", "ffff", "ffff", "ffff", "ffff", "ffff"), six("2001", "db9", "", "")];
  const v = fixture({ "in.md": inside.join("\n"), "out.md": outside.join("\n") });
  assert.deepEqual(at(v, "in.md"), [], "loopback, unspecified and documentation, in each writing measured");
  assert.deepEqual(at(v, "out.md").map((h) => h.split(" ")[0]), outside.map((_, i) => `${String(i + 1)}:1`), "the first address on each side of every range");
});

// reddened by: a word glued to a "::" read as an address (the quoted Rust path below ends in a hex digit before its colons)
// killer: scripts/address-literals.mjs:83 SDL "if (glued && cut === null) continue;" -> ""
test("address_literals_read_no_address_in_code_or_numbers_that_only_look_like_one", () => {
  const lines = ["::error::R-25 not configured", "echo '::warning::proof'", ".c-pill::before { content: \"\"; }", ".d-main a::after { content: none; }",
    "AuthorityType::ScaledUiAmount", "only `AuthorityType::` paths", "std::vector<int>", "five8::decode_32", "CompressedEdwardsY::decompress()",
    "1.2.3.4.5", "v1.2.3.4", "1.2.3.4a", "x.1.2.3.4", "999.1.1.1", "01.2.3.4", "12:34:56", "T12:34:56Z", "sha256:abcd:ef01", "de:ad:be:ef:00:01"];
  assert.deepEqual(lines.flatMap((l) => literals(l).map(([lit, col]) => `${l} @${String(col)} ${mask(lit)}`)), []);
});

// reddened by: a listed literal admitted in any file, not in its own one only
// killer: scripts/address-literals.mjs:145 CONST "Object.hasOwn(LISTED, rel) && Object.hasOwn(LISTED[rel], lit)" -> "listedAnywhere(lit)"
test("address_literals_admit_a_listed_literal_in_its_own_file_only", () => {
  const file = "docs/G0-lot-verifiers-list-f5a-1.md", lit = Object.keys(LISTED[file] ?? {})[0] ?? "", self = `"${lit}" then ${A}`;
  const v = fixture({ [file]: `V8 ${lit}-node.53\nhost ${A}\n`, "docs/other.md": `V8 ${lit}-node.53\n`, [SELF]: `${self}\n` });
  assert.deepEqual([at(v, file), at(v, "docs/other.md"), at(v, SELF)], [["2:6 4 x.x.x.x"], ["1:4 4 x.x.x.x"], [`1:${String(self.indexOf(A) + 1)} 4 x.x.x.x`]],
    "the listed literal passes in its file (and in this script), never elsewhere; any other literal of that file is still a hit");
  const pairs = Object.entries(LISTED).flatMap(([f, e]) => Object.keys(e).map((l) => `${f} ${l}`));
  assert.deepEqual(stale(v), pairs.filter((p) => p !== `${file} ${lit}`), "every pair the fixture does not carry is stale, the one it carries is not");
});

// reddened by: a mask that keeps the digits (the report would print the address, in a line and in a file name)
// killer: scripts/address-literals.mjs:115 CONST "literal.replace(/[\\dA-Fa-f]+/g, \"x\")" -> "literal"
test("address_literals_report_names_each_hit_without_a_digit_of_it", () => {
  const r = report(fixture({ "a.md": `see ${A}\n`, "b.md": `x\n[${B}]\n`, [`logs/${C}.txt`]: "clean\n" }));
  assert.deepEqual(r.split("\n"), ["address literals: 3 hit(s) in 3 file(s)", "a.md:1:5 IPv4 x.x.x.x", "b.md:2:2 IPv6 x:x::x", "logs/x.x.x.x.txt:0:6 IPv4 x.x.x.x"]);
  assert.equal([A, B, C].some((l) => r.includes(l)), false, "the report carries no literal");
});

// reddened by: a binary file read as text; also pinned: any extension is read, the index is read (not the disk), a non-ASCII name
// is read (git ls-files -z) and a tracked file deleted in the work tree is skipped
// killer: scripts/address-literals.mjs:163 CONST "buf.includes(0)" -> "false"
test("address_literals_read_every_tracked_text_file_and_skip_binaries", () => {
  const name = `${String.fromCharCode(0xe9)}t${String.fromCharCode(0xe9)}.md`;
  const v = fixture({ "deploy/u.service": `# host (${A})\n`, Caddyfile: `${A} {\n`, [name]: `${A}\n`, "bin.dat": Buffer.concat([Buffer.from([0]), Buffer.from(`${A}\n`)]),
    "gone.md": `${A}\n` }, { "loose.md": `${A}\n` }, (root) => { rmSync(join(root, "gone.md")); });
  assert.deepEqual(v.hits.map((h) => `${h.file}:${String(h.line)}`).sort(), ["Caddyfile:1", "deploy/u.service:1", `${name}:1`].sort());
  assert.equal(v.read, 3, "three text files read: the binary, the loose and the deleted ones are not");
});

// reddened by: no copy of the line with its %XX decoded, so a literal right after an escape (a URL parameter, a log line) is never read
// killer: scripts/address-literals.mjs:96 CONST "text.search(ESCAPE) < 0" -> "true"
test("address_literals_read_an_address_behind_a_percent_escape", () => {
  const pct = (s: string): string => [...s].map((c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).join("");
  const v = fixture({ "a.log": [`url=http%3A%2F%2F${A}%2Fx`, `h%3A${B}`, `%5B${B}%5D`, `ssh%20root%40${A}`, `see ${A}%20now`, pct(A),
    B.split(":").join("%3A"), `100% of ${A}%zz`, `connect%20${B}:%20refused`].join("\n"), [`logs/%40${A}.txt`]: "x\n", [`logs/${pct(C)}.txt`]: "x\n",
    [`logs/v${A}/${A}.txt`]: "x\n", [`logs/${B.split(":").join("%3A")}/x`]: "x\n" });
  assert.deepEqual(at(v, "a.log"), ["1:18 4 x.x.x.x", "2:5 6 x:x::x", "3:4 6 x:x::x", "4:14 4 x.x.x.x", "5:5 4 x.x.x.x", "6:1 4 x.x.x.x",
    "7:1 6 x:x::x", "8:9 4 x.x.x.x", "9:11 6 x:x::x"], "one hit per address, at its column in the line as written; a stray % is no escape and never throws");
  assert.deepEqual([at(v, "logs/%x.x.x.x.txt"), at(v, `logs/${"%x".repeat(10)}.txt`), at(v, "logs/vx.x.x.x/x.x.x.x.txt"), at(v, "logs/x%x%x%x/x")],
    [["0:9 4 x.x.x.x"], ["0:6 4 x.x.x.x"], ["0:18 4 x.x.x.x"], ["0:6 6 x:x::x"]],
    "a path is read decoded too, printed with each hex run of a literal masked (escapes included) and with its text masked where it recurs");
});

// reddened by: the full stops after a run stripped by /\.+$/, quadratic on dots that do not end the run (about 1.4 s for these, here)
// killer: scripts/address-literals.mjs:86 CONST "while (end > 0 && t[end - 1] === \".\") end--;" -> "end = t.replace(/\\.+$/, \"\").length;"
test("address_literals_read_forty_thousand_dots_in_bounded_time", () => {
  const line = `1:2:${".".repeat(40_000)}3`;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now(), got = literals(line);
    best = Math.min(best, performance.now() - t0);
    assert.deepEqual(got, [], "colons and dots, no address");
  }
  assert.ok(best < 250, `the best of three reads of 40,000 dots took ${best.toFixed(0)} ms, over the 250 ms bound (a linear read takes under 1 ms)`);
});

// reddened by: a skipped file reported whatever its attributes, so a declared binary is refused and an undeclared one passes
// killer: scripts/address-literals.mjs:180 ROR "!== \"set\"" -> "=== \"set\""
test("address_literals_name_each_skipped_file_that_gitattributes_does_not_declare_binary", () => {
  const nul = (s: string): Buffer => Buffer.concat([Buffer.from([0]), Buffer.from(`${s}\n`)]);
  const v = fixture({ ".gitattributes": "*.bin binary\n*.raw -text\n", "a.bin": nul("a"), "b.raw": nul("b"), [`c-${A}.dat`]: nul("c"), "d.md": "d\n" }, {},
    (root) => { // a global attributes file that declares every path binary: the gate reads the attributes of the tree only
      const attributes = join(dirname(root), "attributes");
      writeFileSync(attributes, "* binary\n");
      writeFileSync(join(dirname(root), "gitconfig"), `[core]\n\tattributesFile = "${attributes.split("\\").join("/")}"\n`);
    });
  assert.deepEqual(v.undeclared, ["b.raw", "c-x.x.x.x.dat"], "a NUL byte without a binary declaration is named, its path masked; a declared binary is not");
  assert.equal(v.read, 2, "the two text files only");
});

// reddened by: a path masked where its literal is written and where its text recurs as written only, so a recurrence escaped and
// glued to a word, which no pass reads, prints the digits of the address; also pinned: a lowercase escape is read, a decoded
// digit glued to an address reads a second, longer one at its column (two hits for one address written, both masked), a hit
// read in a file masks its address in that file's path too, where it recurs glued to a word, and every address the check reads,
// in any file or line, is masked in each path it prints, wherever and in whatever text form it recurs
// killer: scripts/address-literals.mjs:128 CONST "rel[j] === \"%\" && " -> "false && "
test("address_literals_mask_a_path_wherever_its_address_recurs_escaped", () => {
  const esc = (e: string): string => A.split(".").join(e), E = q(198, 19, 0, 1);
  const v = fixture({ "a.log": `h%5b${B}\n`, "b.log": `${A}%35\n`, [`logs/v${esc("%2e")}/${esc("%2e")}.txt`]: "x\n",
    [`logs/v${esc("%2E")}/${A}.txt`]: "x\n", [`logs/${C}/${A}.txt`]: "x\n",
    [`logs/host${E}.txt`]: `${E}\n`, [`logs/host${E.split(".").join("%2E")}.txt`]: `${E}\n` });
  // killer: scripts/address-literals.mjs:74 CONST "/%[\\dA-Fa-f]{2}/g" -> "/%[\\dA-F]{2}/g"
  assert.deepEqual(at(v, "a.log"), ["1:5 6 x:x::x"], "a lowercase escape is read (RFC 3986: either case)");
  // killer: scripts/address-literals.mjs:106 CONST "!seen.has(`${String(at[a])} ${lit}`)" -> "!out.some(([, s, e]) => s < at[b] && at[a] < e)"
  assert.deepEqual(at(v, "b.log"), ["1:1 4 x.x.x.x", "1:1 4 x.x.x.x"], "a decoded digit glued to an address: two readings that overlap, two hits, both masked");
  assert.deepEqual([at(v, "logs/vx%x%x%x/x%x%x%x.txt"), at(v, "logs/vx%x%x%x/x.x.x.x.txt"), at(v, "logs/x.x.x.x/x.x.x.x.txt")],
    [["0:24 4 x.x.x.x"], ["0:24 4 x.x.x.x"], ["0:6 4 x.x.x.x", "0:17 4 x.x.x.x"]],
    "an escaped recurrence glued to a word is masked too, whichever pass read the literal, and so is each literal of a path: no digit of an address");
  // killer: scripts/address-literals.mjs:143 CONST "seen.addAddress(" -> "line === 0 && seen.addAddress("
  assert.deepEqual([at(v, "logs/hostx.x.x.x.txt"), at(v, "logs/hostx%x%x%x.txt")], [["1:1 4 x.x.x.x"], ["1:1 4 x.x.x.x"]],
    "a hit read in a file masks its address in that file's path too, written or escaped and glued to a word, where no pass reads it");
  // a second tree, one address per case, each read once where the case says and carried by a path in a form no pass reads
  const d = (k: number, o: number): string => q(198, 19, k, o), z = ["2001", "0002", "0000", "0000", "0000", "0000"];
  const w = fixture({ [`bin/host${d(10, 10)}.dat`]: Buffer.from([0]), [`logs/${d(5, 1)}/${q(192, 0, 2, 1)}/host${d(5, 5)}.txt`]: `${d(5, 5)}\n`,
    [`logs/host${d(2, 2)}.txt`]: `${six("", "", "ffff", d(2, 2))}\n`, [`logs/long${[...z, "0000", "0007"].join("%3A")}.txt`]: `[${B}]\n`,
    [`logs/mix${d(3, 3)}.txt`]: `${d(3, 3)}%35\n`, [`logs/mop${d(7, 4)}.txt`]: `${six("", "", "ffff", "c613", "704")}\n`, [`logs/own${d(4, 4)}.txt`]: `${d(4, 1)}\n`,
    [`logs/pin${d(8, 80).split(".").map((o) => o.padStart(3, "0")).join(".")}.txt`]: `${d(8, 80)}\n`, [`logs/two${d(1, 2)}.txt`]: `${d(1, 1)}\n${d(1, 2)}\n`,
    [`logs/short${["2001", "2", "0", "0", "0", "0", "a", "", ""].join("%3a")}.txt`]: `[${six(...z, "000A", "0000")}]\n`, "z.txt": `${d(4, 4)}\n${d(10, 10)}\n`,
    [`logs/tail${[...z, q(100, 127, 255, 255)].join("%3A")}.txt`]: `[${six("2001", "2", "", "647f", "ffff")}]\n`,
    [`logs/v${q(198, 18, 198, 18, 198, 18)}.txt`]: `${q(198, 18, 198, 18)}\n` });
  // killer: scripts/address-literals.mjs:143 CONST "seen.addAddress(lit, kind === 4 ? \"ipv4\" : \"ipv6\")" -> "kind === 4 && seen.addAddress(lit, \"ipv4\")"
  // killer: scripts/address-literals.mjs:133 CONST "t.split(\".\").map(Number).join(\".\")" -> "t"
  // killer: scripts/address-literals.mjs:168 SDL "for (const h of v.hits) h.file = show(h.file);" -> ""
  // killer: scripts/address-literals.mjs:169 CONST ".map(show)" -> ""
  assert.deepEqual([w.hits.length, [...new Set(w.hits.map((h) => h.file)), ...w.undeclared]], [18, ["logs/x.x.x.x/x.x.x.x/hostx.x.x.x.txt", "logs/hostx.x.x.x.txt",
    "logs/longx%x%x%x%x%x%x%x.txt", "logs/mixx.x.x.x.txt", "logs/mopx.x.x.x.txt", "logs/ownx.x.x.x.txt", "logs/pinx.x.x.x.txt", "logs/shortx%x%x%x%x%x%x%x%x.txt",
    "logs/tailx%x%x%x%x%x%x.x.x.x.txt", "logs/twox.x.x.x.txt", "logs/vx.x.x.x.x.x.txt", "z.txt", "bin/hostx.x.x.x.dat"]], "path literals (one admitted) beside a " +
    "content address, a mapped line's IPv4, an IPv6 in each long form or case, both readings, a mapped one in hex, a later file, zero-padded octets, another hit " +
    "of the file, a recurrence over itself, an undeclared binary");
});

// reddened by: a tracked link followed, so a dangling one passes unread and one to a file outside the tree reads that file, and a
// gitlink whose directory exists (a checked-out submodule) read as a file (EISDIR): a link is judged by its text, a gitlink by its path
// killer: scripts/address-literals.mjs:161 CONST "st.isSymbolicLink() ? readlinkSync(p, { encoding: \"buffer\" }) : readFileSync(p)" -> "readFileSync(p)"
test("address_literals_judge_a_link_by_its_text_never_followed_and_a_gitlink_by_its_path", () => {
  const link = (root: string, to: string, rel: string): void => { // as git checks a link out: a link, on win32 a text file of its target (core.symlinks=false)
    if (process.platform === "win32") writeFileSync(join(root, rel), to); else symlinkSync(to, join(root, rel));
  };
  const v = fixture({ "x.md": "x\n" }, {}, (root, env) => {
    writeFileSync(join(dirname(root), "outside.md"), `${C}\n`);
    link(root, `../logs/0/${A}.txt`, "gone"); link(root, "../outside.md", "out"); link(root, "x.md", "in");
    execFileSync("git", ["add", "--", "gone", "out", "in"], { cwd: root, env });
  });
  assert.deepEqual(v.hits.map((h) => `${h.file}:${String(h.line)}:${String(h.col)}`), ["gone:1:11"],
    "a dangling link is judged by its text; the file outside the tree that a link names is never read");
  assert.equal(v.read, 4, "x.md, and each of the three links by its text");
  // killer: scripts/address-literals.mjs:160 SDL "if (!st.isFile() && !st.isSymbolicLink()) continue;" -> ""
  assert.doesNotThrow(() => fixture({ "x.md": "x\n" }, {}, (root, env) => {
    execFileSync("git", ["update-index", "--add", "--cacheinfo", `160000,${"5".repeat(40)},sub`], { cwd: root, env });
    mkdirSync(join(root, "sub"));
  }), "a gitlink whose directory exists: its path is judged, nothing in it is read");
});
