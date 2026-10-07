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
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
function fixture(tracked: Record<string, string | Buffer>, loose: Record<string, string> = {}, afterAdd: (root: string) => void = () => undefined): Verdict {
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
  afterAdd(root);
  return scan(root, env);
}
const at = (v: Verdict, file: string): string[] => v.hits.filter((h) => h.file === file).map((h) => `${String(h.line)}:${String(h.col)} ${String(h.kind)} ${h.mask}`);

// The tracked tree, red on the base eb1beb01 (the two host addresses in 35 files, and the other literals), green once they are gone.
// killer: scripts/address-literals.mjs:18 SDL "EXEMPT.addSubnet(\"127.0.0.0\", 8, \"ipv4\");" -> ""
test("address_literals_tracked_tree_is_clean", () => {
  const v = scan(REPO);
  assert.ok(v.read > 1000, `implausibly few tracked text files read (${String(v.read)})`);
  assert.deepEqual(stale(v), [], "a listed literal that its file no longer carries: the entry leaves LISTED");
  assert.equal(v.hits.length, 0, report(v));
});

// reddened by: a label cut only when it is a lone colon, so a word that ends with a hex digit hides the address glued after it
// killer: scripts/address-literals.mjs:81 CONST "/^[^:]*:(?!:)/" -> "/^:(?!:)/"
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
// killer: scripts/address-literals.mjs:82 SDL "if (glued && cut === null) continue;" -> ""
test("address_literals_read_no_address_in_code_or_numbers_that_only_look_like_one", () => {
  const lines = ["::error::R-25 not configured", "echo '::warning::proof'", ".c-pill::before { content: \"\"; }", ".d-main a::after { content: none; }",
    "AuthorityType::ScaledUiAmount", "only `AuthorityType::` paths", "std::vector<int>", "five8::decode_32", "CompressedEdwardsY::decompress()",
    "1.2.3.4.5", "v1.2.3.4", "1.2.3.4a", "x.1.2.3.4", "999.1.1.1", "01.2.3.4", "12:34:56", "T12:34:56Z", "sha256:abcd:ef01", "de:ad:be:ef:00:01"];
  assert.deepEqual(lines.flatMap((l) => literals(l).map(([lit, col]) => `${l} @${String(col)} ${mask(lit)}`)), []);
});

// reddened by: a listed literal admitted in any file, not in its own one only
// killer: scripts/address-literals.mjs:102 CONST "Object.hasOwn(LISTED, rel) && Object.hasOwn(LISTED[rel], lit)" -> "listedAnywhere(lit)"
test("address_literals_admit_a_listed_literal_in_its_own_file_only", () => {
  const file = "docs/G0-lot-verifiers-list-f5a-1.md", lit = Object.keys(LISTED[file] ?? {})[0] ?? "", self = `"${lit}" then ${A}`;
  const v = fixture({ [file]: `V8 ${lit}-node.53\nhost ${A}\n`, "docs/other.md": `V8 ${lit}-node.53\n`, [SELF]: `${self}\n` });
  assert.deepEqual([at(v, file), at(v, "docs/other.md"), at(v, SELF)], [["2:6 4 x.x.x.x"], ["1:4 4 x.x.x.x"], [`1:${String(self.indexOf(A) + 1)} 4 x.x.x.x`]],
    "the listed literal passes in its file (and in this script), never elsewhere; any other literal of that file is still a hit");
  const pairs = Object.entries(LISTED).flatMap(([f, e]) => Object.keys(e).map((l) => `${f} ${l}`));
  assert.deepEqual(stale(v), pairs.filter((p) => p !== `${file} ${lit}`), "every pair the fixture does not carry is stale, the one it carries is not");
});

// reddened by: a mask that keeps the digits (the report would print the address, in a line and in a file name)
// killer: scripts/address-literals.mjs:92 CONST "literal.replace(/[\\dA-Fa-f]+/g, \"x\")" -> "literal"
test("address_literals_report_names_each_hit_without_a_digit_of_it", () => {
  const r = report(fixture({ "a.md": `see ${A}\n`, "b.md": `x\n[${B}]\n`, [`logs/${C}.txt`]: "clean\n" }));
  assert.deepEqual(r.split("\n"), ["address literals: 3 hit(s) in 3 file(s)", "a.md:1:5 IPv4 x.x.x.x", "b.md:2:2 IPv6 x:x::x", "logs/x.x.x.x.txt:0:6 IPv4 x.x.x.x"]);
  assert.equal([A, B, C].some((l) => r.includes(l)), false, "the report carries no literal");
});

// reddened by: a binary file read as text; also pinned: any extension is read, the index is read (not the disk), a non-ASCII name
// is read (git ls-files -z) and a tracked file deleted in the work tree is skipped
// killer: scripts/address-literals.mjs:116 CONST "buf.includes(0)" -> "false"
test("address_literals_read_every_tracked_text_file_and_skip_binaries", () => {
  const name = `${String.fromCharCode(0xe9)}t${String.fromCharCode(0xe9)}.md`;
  const v = fixture({ "deploy/u.service": `# host (${A})\n`, Caddyfile: `${A} {\n`, [name]: `${A}\n`, "bin.dat": Buffer.concat([Buffer.from([0]), Buffer.from(`${A}\n`)]),
    "gone.md": `${A}\n` }, { "loose.md": `${A}\n` }, (root) => { rmSync(join(root, "gone.md")); });
  assert.deepEqual(v.hits.map((h) => `${h.file}:${String(h.line)}`).sort(), ["Caddyfile:1", "deploy/u.service:1", `${name}:1`].sort());
  assert.equal(v.read, 3, "three text files read: the binary, the loose and the deleted ones are not");
});
