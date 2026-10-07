// test/spec-retire-path.test.ts -- lot R-b of ENGINE-ROW-RETIRE-PATH-1 (draft G0 4.3 to 4.5 and 5; F-1 of MONARK's review, section 5; the
// fold of its G2, B-1, M-1, M-2): the dated table version that scripts/spec-policy-tables.mjs writes (R-T7), SERVED_TABLE_DIRS, which keeps
// "served table = published table" per class in its own directory (R-T8), the publication rules of scripts/spec-publish.mjs on a dated
// release made of the writer's files and of the entries it prints (R-T9), the retire list that a dated directory with a retired row carries
// (F-1), a dated directory written once and never rewritten, the write without a date keeping the base's behaviour (B-1, M-2), the gate's
// retire rule over every policy/ file of a release (M-1), and the latency report of scripts/retire-latency.mjs (R-T10). Offline: no network;
// every root is a copy under the OS temp directory; a changed or retired row is synthetic, with only the columns the publication gate reads.
// The new exports are loaded on demand, so the base, which lacks them, reddens by assertion, not by import. Each test names on the line
// above it the production mutation that reddens it (scripts/red-proof.mjs).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Canonical } from "@monark/contracts";
import { SERVED_POLICY_TABLES } from "../apps/harness/src/tools/gate.ts";
import { canonicalJson, plan } from "../scripts/spec-publish.mjs";
import type { Inputs } from "../scripts/spec-publish.mjs";

type Entry = Inputs["releases"][string]["entries"][number];
type Writer = typeof import("../scripts/spec-policy-tables.mjs");
type Latency = typeof import("../scripts/retire-latency.mjs");
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WRITER = join(ROOT, "scripts", "spec-policy-tables.mjs"), LATENCY = join(ROOT, "scripts", "retire-latency.mjs");
const TMP = mkdtempSync(join(tmpdir(), "spec-retire-path-"));
after(() => { rmSync(TMP, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const run = (script: string, ...a: string[]): { status: number | null; stdout: string; stderr: string } => spawnSync(process.execPath, [script, ...a], { encoding: "utf8" });
/** A root holding a copy of this repository's schemas/ and spec/ (contract-1.1.0 as published at T0). */
const copy = (): string => {
  const r = join(TMP, `r${String(++made)}`);
  for (const d of ["schemas", "spec"]) cpSync(join(ROOT, d), join(r, d), { recursive: true });
  return r;
};
/** Every file under a directory with its sha256, sorted. */
const digest = (d: string): string[] => readdirSync(d, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => `${join(e.parentPath, e.name)} ${sha(readFileSync(join(e.parentPath, e.name)))}`).sort();
const D = "2026-11-02", DIR = `contract-1.1.0-tables-${D}`;
const ROW = { cell_key: "kata:vote4-v1@binance/BTCUSDT/1h/up", status: "region", n: 92, p_served: null, recompute: null, aux_sha256: null, series_sha256: null };
/** The served tables, btc-dir-1h holding one synthetic row of this status. */
const withRow = (status: string): { task_class: string; table: object; policy_table_sha256: string }[] => SERVED_POLICY_TABLES.map((t) => {
  if (t.task_class !== "btc-dir-1h") return t;
  const table = { ...t.table, rows: [{ ...ROW, status }] };
  return { task_class: t.task_class, table, policy_table_sha256: sha256Canonical(table) };
});
/** The writer with its dated-version exports, loaded on demand (the base's writer lacks them: red by assertion, not by import). */
async function writer(): Promise<Writer> {
  const m: Partial<Writer> = await import("../scripts/spec-policy-tables.mjs");
  assert.ok([m.datedDir, m.datedFiles, m.writeDated, m.writeFlat, m.servedTableDirs, m.releaseEntries].every((f) => typeof f === "function"), "scripts/spec-policy-tables.mjs exports the dated table version");
  return m;
}
async function latency(): Promise<Latency> {
  const m = await import("../scripts/retire-latency.mjs").then((x: Latency) => x, () => null);
  assert.ok(m !== null, "scripts/retire-latency.mjs loads");
  return m;
}
/** A previous tree: a git repository under TMP that publishes these files, committed. A caller's (a hook's) GIT_DIR, GIT_WORK_TREE or
 *  GIT_INDEX_FILE never reaches the git child: it works in its own repository only (TEST-GIT-ENV-ISOLATION-1). */
const GIT_CHILD_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_(?:DIR|WORK_TREE|INDEX_FILE)$/i.test(k)));
function previousTree(files: Record<string, string | Buffer>): { dir: string; head: string } {
  const dir = join(TMP, `prev${String(++made)}`), git = (...a: string[]): string => {
    const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t.invalid", "-c", "commit.gpgsign=false", ...a], { cwd: dir, encoding: "utf8", env: GIT_CHILD_ENV });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  for (const [p, b] of Object.entries(files)) { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), b); }
  git("init", "-q"); git("add", "-A"); git("commit", "-qm", "v");
  return { dir, head: git("rev-parse", "HEAD") };
}

// killer: scripts/spec-policy-tables.mjs:155 CONST "`${VERSION_DIR}-tables-${date}`" -> "VERSION_DIR"
test("tables_writer_targets_a_dated_dir", async () => {
  const w = await writer(), r = copy(), before = digest(join(r, "spec", "contract-1.1.0")), tables = withRow("region"), btc = canonicalJson(tables.find((t) => t.task_class === "btc-dir-1h")?.table);
  assert.equal(w.datedDir(D), DIR);
  const files = await w.datedFiles(r, D, tables);
  assert.deepEqual(files, [{ path: `spec/${DIR}/policy/btc-dir-1h.json`, text: btc }], "the changed class only, as a whole canonical file");
  w.writeDated(r, files);
  assert.deepEqual([readFileSync(join(r, "spec", DIR, "policy", "btc-dir-1h.json"), "utf8"), digest(join(r, "spec", "contract-1.1.0"))], [btc, before], "nothing written under contract-1.1.0/");
  await assert.rejects(w.datedFiles(r, "2026-02-30", tables), /2026-02-30 is not a real calendar day/);
  await assert.rejects(w.datedFiles(r, "2026-11-01", tables), /contract-1\.1\.0-tables-2026-11-02 is later than contract-1\.1\.0-tables-2026-11-01/);
  await assert.rejects(w.datedFiles(copy(), D, SERVED_POLICY_TABLES), /no dated version to write/);
  assert.throws(() => w.writeDated(r, [{ path: "spec/contract-1.1.0/policy/btc-dir-1h.json", text: "{}" }]), /never under spec\/contract-1\.1\.0\//);
  assert.throws(() => w.writeDated(r, [{ path: "spec/contract-1.1.0-tables-2026-11-05/other/x.json", text: "{}" }]), /tables-2026-11-05\/other\/x\.json: a dated version writes under spec\/contract-1\.1\.0-tables-<YYYY-MM-DD>\/policy\/ or retire\/ only/);
  const cli = copy(), served = canonicalJson(SERVED_POLICY_TABLES.find((t) => t.task_class === "btc-dir-1h")?.table);
  writeFileSync(join(cli, "spec", "contract-1.1.0", "policy", "btc-dir-1h.json"), "{}"); // the published file differs from the served table
  const ok = run(WRITER, "--write", "--date", D, "--root", cli);
  assert.deepEqual([ok.status, readFileSync(join(cli, "spec", DIR, "policy", "btc-dir-1h.json"), "utf8") === served, ok.stdout.includes(`{"out": "${DIR}/policy/btc-dir-1h.json", "root": "governance"`),
    run(WRITER, "--write", "--date", "2026-02-30", "--root", cli).status, run(WRITER, "--check", "--date", D).status], [0, true, true, 1, 2], ok.stdout + ok.stderr);
});

// killer: scripts/spec-policy-tables.mjs:60 CONST "dirs[t.task_class]" -> "VERSION_DIR"
test("served_table_equals_published_table_by_dir", async () => {
  const w = await writer(), r = copy(), tables = withRow("region"), D3 = "contract-1.1.0-tables-2026-11-03";
  assert.deepEqual(Object.values(w.servedTableDirs(ROOT, SERVED_POLICY_TABLES)), Array<string>(35).fill("contract-1.1.0"), "today every class is served from contract-1.1.0");
  w.writeDated(r, await w.datedFiles(r, D, tables));
  const dirs = w.servedTableDirs(r, tables);
  assert.deepEqual([Object.keys(dirs).length, Object.entries(dirs).filter(([, d]) => d !== "contract-1.1.0")], [35, [["btc-dir-1h", DIR]]]);
  for (const t of tables) assert.equal(sha(readFileSync(join(r, "spec", dirs[t.task_class] ?? "", "policy", `${t.task_class}.json`))), t.policy_table_sha256, t.task_class);
  assert.deepEqual([w.differences(r, await w.expectedFiles(r, tables)), w.differences(r, await w.expectedFiles(r))], [[], [`differ spec/${DIR}/policy/btc-dir-1h.json`]],
    "the superseded file of contract-1.1.0 is kept; a dated table that the harness does not serve differs");
  cpSync(join(r, "spec", DIR), join(r, "spec", D3), { recursive: true });
  assert.throws(() => w.servedTableDirs(r, tables), (e: unknown) => e instanceof Error && e.message.includes(`btc-dir-1h: two directories publish the same table (${DIR}, ${D3})`));
  for (const d of ["contract-1.1.0", DIR, D3]) rmSync(join(r, "spec", d, "policy", "btc-dir-1h.json"));
  await assert.rejects(w.datedFiles(r, "2026-11-04", tables), /btc-dir-1h: no directory publishes its table/);
  assert.deepEqual([w.servedTableDirs(r, tables)["btc-dir-1h"], w.differences(r, await w.expectedFiles(r, tables))], ["contract-1.1.0", ["missing spec/contract-1.1.0/policy/btc-dir-1h.json"]],
    "M-2: without a date, a class that no directory holds is expected under contract-1.1.0/ and reported missing, as at the base");
  assert.deepEqual(new Set(Object.values(w.servedTableDirs(join(TMP, "no-version"), tables))), new Set(["contract-1.1.0"]), "a root with no version yet: contract-1.1.0 for every class");
});

// killer: scripts/spec-publish.mjs:201 CONST " && o.split(\"/\")[0] !== release" -> ""
test("dated_release_keeps_publication_rules", async () => {
  const w = await writer(), r = copy(), files = await w.datedFiles(r, D, withRow("region"));
  w.writeDated(r, files);
  const prev = previousTree({ "KATA-SPEC.md": "# Spec\n", "contract-1.1.0/NOTE.md": "# Note\n", "contract-1.1.0/policy/btc-dir-1h.json": readFileSync(join(r, "spec", "contract-1.1.0", "policy", "btc-dir-1h.json")) });
  const carried = ["KATA-SPEC.md", "contract-1.1.0/NOTE.md", "contract-1.1.0/policy/btc-dir-1h.json"].map((out): Entry => ({ out, root: "previous", path: out, kind: out.endsWith(".json") ? "policy-table" : "text", sha256: sha(readFileSync(join(prev.dir, out))) }));
  const own = w.releaseEntries(files).map((l) => JSON.parse(l) as Entry), x = (out: string): Entry => ({ out, root: "governance", path: "x.md", kind: "text", sha256: sha("# X\n") });
  writeFileSync(join(r, "x.md"), "# X\n");
  const codes = (entries: Entry[]): string[] => plan({ inputs: { format: "spec-inputs-v1", releases: { [DIR]: { previous_commit: prev.head, entries } } }, release: DIR, date: D, roots: { governance: r, previous: prev.dir } }).problems.map((p) => p.code);
  assert.deepEqual(own, [{ out: `${DIR}/policy/btc-dir-1h.json`, root: "governance", path: `spec/${DIR}/policy/btc-dir-1h.json`, kind: "policy-table", sha256: sha(files[0]?.text ?? "") }]);
  assert.deepEqual([codes([...carried, ...own]), codes([...carried, ...own, x("contract-1.1.0/x.md")]), codes([...carried.map((e) => (e.out === "contract-1.1.0/NOTE.md" ? x(e.out) : e)), ...own]),
    codes([...carried.slice(1), ...own]), codes([...carried, ...own, x("contract-1.1.0-tables-2026-11-03/x.md")])], [[], ["added_to_published"], ["rewritten"], ["withdrawn"], ["foreign_version_dir"]]);
});

// killer: scripts/spec-policy-tables.mjs:172 CONST "t.table.rows.some((r) => r?.status === \"retired\")" -> "false"
test("a_dated_directory_with_a_retired_row_carries_its_retire_list", async () => {
  const w = await writer(), r = copy(), day = "2027-01-05", dir = `contract-1.1.0-tables-${day}`, tables = withRow("retired"), lists = join(r, "apps", "harness", "data", "kata", "retire");
  const A = { format: "kata-retire-v1", entries: [{ cause: "adr:decisions/0007-retire-btc.md", cell_key: ROW.cell_key, task_class: "btc-dir-1h" }] }, list = `spec/${dir}/retire/retire-${day}.json`;
  await assert.rejects(w.datedFiles(r, day, tables), /F-1: btc-dir-1h hold\(s\) a retired row and no retire list is in force at 2027-01-05/);
  mkdirSync(lists, { recursive: true });
  writeFileSync(join(lists, "retire-2027-01-02.json"), `${JSON.stringify(A, null, 2)}\n`); writeFileSync(join(lists, "retire-2027-01-09.json"), "{}");
  const files = await w.datedFiles(r, day, tables);
  assert.deepEqual(files.map((f) => [f.path, f.path.includes("/retire/") ? f.text : ""]), [[`spec/${dir}/policy/btc-dir-1h.json`, ""], [list, canonicalJson(A)]], "the list in force at the date, not a later one, canonical");
  assert.deepEqual((await w.datedFiles(r, day, withRow("region"))).map((f) => f.path), [`spec/${dir}/policy/btc-dir-1h.json`], "no retired row: no list, though one is in force");
  w.writeDated(r, files);
  const check = async (): Promise<string[]> => w.differences(r, await w.expectedFiles(r, tables));
  assert.deepEqual(await check(), []);
  rmSync(join(r, list));
  assert.deepEqual(await check(), [`missing ${list}`]);
  writeFileSync(join(r, list), canonicalJson(A)); writeFileSync(join(r, "pretty.json"), JSON.stringify(A, null, 1));
  const table = JSON.parse(w.releaseEntries(files)[0] ?? "") as Entry, at = (out: string, path = list): Entry => ({ out, root: "governance", path, kind: "json", sha256: sha(readFileSync(join(r, path))) });
  const codes = (entries: Entry[], rel = dir): string[] => plan({ inputs: { format: "spec-inputs-v1", releases: { [rel]: { previous_commit: null, entries } } }, release: rel, date: day, roots: { governance: r } }).problems.map((p) => p.code);
  assert.deepEqual([codes([table, at(list.slice(5))]), codes([table]), codes([table, at(`${dir}/retire/retire-2027-01-02.json`)]), codes([table, at(list.slice(5), "pretty.json")]),
    codes([{ ...table, out: "contract-1.2.0/policy/btc-dir-1h.json" }], "contract-1.2.0"), codes([{ ...table, out: "policy/btc-dir-1h.json" }])],
    [[], ["retire_list_missing"], ["retire_list_missing", "retire_list_invalid"], ["not_canonical"], ["retire_list_missing"], ["retire_list_missing"]],
    "a release publishes a retired row from a dated table version only, with its list (a top-level policy/ file included, M-1)");
});

// killer: scripts/spec-policy-tables.mjs:216 CONST "changed.length > 0" -> "false"
test("the_write_without_a_date_keeps_the_base_behaviour_and_never_rewrites_a_dated_directory", async () => {
  const w = await writer(), base = copy(), eth = (root: string): string => join(root, "spec", "contract-1.1.0", "policy", "eth-dir-1h.json"), served = readFileSync(eth(base));
  rmSync(eth(base)); // M-2, the verifier's probe 5: as at a43b0126, --check reports the missing file and --write restores it
  const check = run(WRITER, "--check", "--root", base), write = run(WRITER, "--write", "--root", base);
  assert.deepEqual([check.status, check.stdout, write.status, write.stdout, readFileSync(eth(base)).equals(served), run(WRITER, "--check", "--root", base).status],
    [1, "missing spec/contract-1.1.0/policy/eth-dir-1h.json\nspec-policy-tables DIFFERENT: 40 file(s) under spec/contract-1.1.0\n", 0, "spec-policy-tables OK: 40 file(s) under spec/contract-1.1.0\n", true, 0],
    "the base's outputs, word for word (a43b0126)");
  const r = copy(), tables = withRow("region"), f = join(r, "spec", DIR, "policy", "btc-dir-1h.json");
  w.writeDated(r, await w.datedFiles(r, D, tables)); // B-1, the verifier's probe 3: a dated table that is no longer the served one
  const before = sha(readFileSync(f));
  rmSync(eth(r));
  const flat = run(WRITER, "--write", "--root", r);
  assert.deepEqual([flat.status, flat.stderr.includes(`spec/${DIR}/policy/btc-dir-1h.json: a dated directory is never rewritten (B-1)`), flat.stderr.includes("--write --date <YYYY-MM-DD>"), sha(readFileSync(f)), existsSync(eth(r))],
    [1, true, true, before, false], `refused by its path, before anything is written: ${flat.stdout}${flat.stderr}`);
  utimesSync(f, 1e9, 1e9);
  w.writeFlat(r, await w.expectedFiles(r, tables)); // the same bytes: the dated file is left as it is, contract-1.1.0/ is written as at the base
  assert.deepEqual([statSync(f).mtimeMs, sha(readFileSync(f)), readFileSync(eth(r)).equals(served)], [1e12, before, true], "a dated file with the same bytes is not written either");
});

// killer: scripts/spec-policy-tables.mjs:184 CONST "there.length > 0" -> "false"
test("a_dated_directory_is_never_rewritten_even_on_its_own_date", async () => {
  const w = await writer(), r = copy(), f = join(r, "spec", DIR, "policy", "btc-dir-1h.json");
  w.writeDated(r, await w.datedFiles(r, D, withRow("region")));
  const before = sha(readFileSync(f)), again = await w.datedFiles(r, D, withRow("under_calib")); // the same day, another table
  assert.throws(() => w.writeDated(r, again), /spec\/contract-1\.1\.0-tables-2026-11-02 already exists: a dated directory is never rewritten, whatever the option; to redo it before its publication, remove it with git, then write it again/);
  const cli = copy(), g = join(cli, "spec", DIR, "policy", "btc-dir-1h.json");
  writeFileSync(join(cli, "spec", "contract-1.1.0", "policy", "btc-dir-1h.json"), "{}"); // the published file differs from the served table
  const first = run(WRITER, "--write", "--date", D, "--root", cli), written = sha(readFileSync(g)), second = run(WRITER, "--write", "--date", D, "--root", cli);
  assert.deepEqual([first.status, second.status, second.stderr.includes(`spec/${DIR} already exists`), sha(readFileSync(f)), sha(readFileSync(g))], [0, 1, true, before, written], second.stdout + second.stderr);
});

// killer: scripts/spec-publish.mjs:312 CONST "/(^|\\/)policy\\//i.test(f.path)" -> "dated.test(f.path)"
test("a_retired_row_is_published_from_a_dated_directory_with_its_list_only", () => {
  const gov = join(TMP, `gov${String(++made)}`), D5 = "contract-1.1.0-tables-2027-01-05", D9 = "contract-1.1.0-tables-2027-01-09", T5 = `${D5}/policy/btc-dir-1h.json`, L5 = `${D5}/retire/retire-2027-01-05.json`;
  const btc = canonicalJson(withRow("retired").find((t) => t.task_class === "btc-dir-1h")?.table), eth = canonicalJson(SERVED_POLICY_TABLES.find((t) => t.task_class === "eth-dir-1h")?.table);
  const A = canonicalJson({ format: "kata-retire-v1", entries: [{ cause: "adr:decisions/0007-retire-btc.md", cell_key: ROW.cell_key, task_class: "btc-dir-1h" }] }), texts: Record<string, string> = { "btc.json": btc, "list.json": A, "eth.json": eth };
  mkdirSync(gov, { recursive: true });
  for (const [n, t] of Object.entries(texts)) writeFileSync(join(gov, n), t);
  const kind = (out: string): Entry["kind"] => (out.includes("/retire/") ? "json" : "policy-table");
  const own = (out: string, path: string): Entry => ({ out, root: "governance", path, kind: kind(out), sha256: sha(texts[path] ?? "") }), carried = (out: string, text: string): Entry => ({ out, root: "previous", path: out, kind: kind(out), sha256: sha(text) });
  const codes = (release: string, entries: Entry[], prev: { dir: string; head: string } | null = null): string[] => plan({ inputs: { format: "spec-inputs-v1", releases: { [release]: { previous_commit: prev?.head ?? null, entries } } },
    release, date: "2027-01-09", roots: prev === null ? { governance: gov } : { governance: gov, previous: prev.dir } }).problems.map((p) => p.code);
  const top = own("policy/btc-dir-1h.json", "btc.json"); // the verifier's probe 2 (a): a top-level policy/ file, no list
  assert.deepEqual([codes(D5, [top]), codes("contract-1.1.0", [top]), codes("contract-1.2.0", [top]), codes(D5, [own(T5, "btc.json"), own(L5, "list.json")])],
    [["retire_list_missing"], ["retire_list_missing"], ["retire_list_missing"], []], "a retired row lies in a dated directory, with its list");
  const prev = previousTree({ [T5]: btc, [L5]: A }), next = [carried(T5, btc), carried(L5, A), own(`${D9}/policy/eth-dir-1h.json`, "eth.json")];
  assert.deepEqual([codes(D9, next, prev), codes(D9, next.filter((x) => x.out !== L5), prev)], [[], ["withdrawn", "retire_list_missing"]], "a list carried from the previous release counts; dropped, its table is refused too");
});

// killer: scripts/retire-latency.mjs:50 CONST "at[i].t < at[i - 1].t" -> "false"
test("retire_latency_report_closed", async () => {
  const l = await latency(), H = 3_600_000, T: Record<string, string> = { T_a: "2027-01-01T00:00:00Z", T_b: "2027-01-01T09:00:00Z", T_c: "2027-01-04T10:00:00Z", T_d: "2027-01-04T15:00:00Z",
    T_e: "2027-01-05T09:00:00Z", T_f: "2027-01-05T11:00:00Z", T_g: "2027-01-06T12:00:00Z" };
  const input = (instants: Record<string, string> = T, o: object = {}): object => ({ format: "retire-latency-v1", cycle: "real", instants, mention: null, ...o });
  const r = l.report(input());
  assert.deepEqual([r.instants.map((i) => [i.name, i.at, i.definition]), r.steps_ms.map((s) => s.ms / H), r.total_ms / H, r.ceiling, r.objective],
    [l.INSTANTS.map(([n, d]) => [n, T[n], d]), [9, 73, 5, 18, 2, 25], 132, { days: 14, exceeded: false, mention: null }, { business_days: 3, business_ms: 84 * H, met: false }],
    "Friday 2027-01-01 to Wednesday noon: 84 business hours, over the objective, reported only");
  const why = (i: object): string => { try { l.report(i); return "ok"; } catch (e) { return e instanceof l.LatencyError ? `${e.code} ${e.message.split(" ")[1] ?? ""}` : String(e); } };
  const late = { ...T, T_g: "2027-01-15T00:00:01Z" }, noD = Object.fromEntries(Object.entries(T).filter(([k]) => k !== "T_d"));
  assert.deepEqual([why(input(noD)), why(input({ ...T, T_e: "2027-01-04T14:00:00Z" })), why(input(late)), why(input(late, { mention: "JOURNAL-PROVENANCE.md, line of the overrun" })),
    why(input({ ...T, T_g: "2027-01-15T00:00:00Z" })), why(input({ ...T, T_c: "2027-02-30T10:00:00Z" })), why(input({ ...T, T_h: "2027-01-07T00:00:00Z" })), why(input(T, { cycle: "drill" }))],
    ["instant_missing T_d", "order_not_monotone T_e", "ceiling_unmentioned T_g", "ok", "ok", "instant_missing T_c", "format_invalid retire-latency-v1", "format_invalid retire-latency-v1"]);
  const f = join(TMP, "instants.json"), g = join(TMP, "late.json");
  writeFileSync(f, JSON.stringify(input())); writeFileSync(g, JSON.stringify(input(late)));
  const ok = run(LATENCY, f), bad = run(LATENCY, g);
  assert.deepEqual([ok.status, (JSON.parse(ok.stdout.split("\nretire-latency OK")[0] ?? "") as { total_ms: number }).total_ms, bad.status, bad.stderr.includes("ceiling_unmentioned"), run(LATENCY).status],
    [0, 132 * H, 1, true, 2], ok.stdout + ok.stderr);
});

// killer: scripts/retire-latency.mjs:44 CONST "if (pub) for" -> "if (false) for"
test("retire_latency_publication_cycle_holds_T_c_to_T_g_only", async () => {
  const l = await latency(), P = { T_c: "2027-01-04T10:00:00Z", T_d: "2027-01-04T15:00:00Z", T_e: "2027-01-05T09:00:00Z", T_f: "2027-01-05T11:00:00Z", T_g: "2027-01-06T12:00:00Z" };
  const why = (instants: object): string => { try { l.report({ format: "retire-latency-v1", cycle: "publication", instants, mention: null }); return "ok"; } catch (e) { return e instanceof l.LatencyError ? `${e.code} ${e.message.split(" ")[1] ?? ""}` : String(e); } };
  const without = (k: string): object => Object.fromEntries(Object.entries(P).filter(([n]) => n !== k));
  const none = ((): string => { try { l.report(null); return "ok"; } catch (e) { return e instanceof l.LatencyError ? e.code : String(e); } })(); // not an object: refused by its code, never a TypeError
  assert.deepEqual([why(P), why({ T_a: "2027-01-01T00:00:00Z", ...P }), why({ ...P, T_b: "2027-01-04T09:00:00Z" }), why(without("T_c")), why(without("T_e")), why({ ...P, T_d: "2027-01-04T09:00:00Z" }), why({ T_a: null, ...P }), none],
    ["ok", "instant_out_of_cycle T_a", "instant_out_of_cycle T_b", "instant_missing T_c", "instant_missing T_e", "order_not_monotone T_d", "instant_out_of_cycle T_a", "format_invalid"], "a publication cycle: T_c to T_g in order, T_a and T_b refused, even null");
});

// killer: scripts/retire-latency.mjs:51 CONST "!pub && total" -> "input.cycle === \"real\" && total"
test("retire_latency_publication_cycle_skips_the_ceiling_and_says_why", async () => {
  const l = await latency(), H = 3_600_000, P = { T_c: "2027-01-04T10:00:00Z", T_d: "2027-01-04T15:00:00Z", T_e: "2027-01-05T09:00:00Z", T_f: "2027-01-05T11:00:00Z", T_g: "2027-01-24T10:00:00Z" };
  const input = { format: "retire-latency-v1", cycle: "publication", instants: P, mention: null }, f = join(TMP, "publication.json");
  const r = ((): ReturnType<Latency["report"]> | string => { try { return l.report(input); } catch (e) { return String(e); } })();
  assert.ok(typeof r !== "string", `a publication cycle of 20 days with no mention is reported, not refused: ${typeof r === "string" ? r : ""}`);
  const reason = "not applicable: a publication cycle has no T_a (Q-RL-2), it is not a retirement";
  assert.deepEqual([r.cycle, r.instants.map((i) => i.name), r.total_ms / H, r.ceiling, r.objective], ["publication", ["T_c", "T_d", "T_e", "T_f", "T_g"], 480, { days: 14, applies: false, reason, mention: null },
    { business_days: 3, business_ms: 350 * H, met: false }], "20 days, 350 business hours (Monday 10:00 to Sunday): the objective is reported on T_c to T_g");
  const late = { T_a: "2027-01-01T00:00:00Z", T_b: "2027-01-01T09:00:00Z", ...P, T_g: "2027-01-15T00:00:01Z" }, met = l.report({ ...input, instants: { ...P, T_g: "2027-01-06T12:00:00Z" } }).objective;
  const why = (cycle: string): string => { try { l.report({ ...input, cycle, instants: late }); return "ok"; } catch (e) { return e instanceof l.LatencyError ? `${e.code} ${e.message.split(" ")[1] ?? ""}` : String(e); } };
  assert.deepEqual([met, why("rehearsal"), why("real")], [{ business_days: 3, business_ms: 50 * H, met: true }, "ceiling_unmentioned T_g", "ceiling_unmentioned T_g"], "Monday 10:00 to Wednesday noon is met; the ceiling binds a rehearsal as a real cycle");
  writeFileSync(f, JSON.stringify(input));
  const out = run(LATENCY, f);
  assert.deepEqual([out.status, out.stdout.trimEnd().split("\n").at(-1)], [0, `retire-latency OK: publication cycle, T_g - T_c ${String(480 * H)} ms, ceiling ${reason}, objective not met (reported only)`], out.stderr);
});

// killer: scripts/retire-latency.mjs:44 CONST "pub && input.mention !== null" -> "false"
test("retire_latency_publication_cycle_refuses_a_mention", async () => {
  const l = await latency(), P = { T_c: "2027-01-04T10:00:00Z", T_d: "2027-01-04T15:00:00Z", T_e: "2027-01-05T09:00:00Z", T_f: "2027-01-05T11:00:00Z", T_g: "2027-01-06T12:00:00Z" };
  const input = (o: object = {}): object => ({ format: "retire-latency-v1", cycle: "publication", instants: P, mention: null, ...o }), f = join(TMP, "publication-mention.json");
  const why = (i: object): string => { try { l.report(i); return "ok"; } catch (e) { return e instanceof l.LatencyError ? `${e.code} ${e.message.split(" ")[1] ?? ""}` : String(e); } };
  assert.deepEqual([why(input()), why(input({ mention: "JOURNAL line 12" })), why(input({ instants: { T_a: "2027-01-01T00:00:00Z", ...P }, mention: "JOURNAL line 12" }))],
    ["ok", "mention_out_of_cycle mention", "instant_out_of_cycle T_a"], "no ceiling applies to a publication (Q-RL-2): a mention of an overrun has no meaning there, and is refused");
  writeFileSync(f, JSON.stringify(input({ mention: "JOURNAL line 12" })));
  const out = run(LATENCY, f);
  assert.deepEqual([out.status, out.stdout, out.stderr.startsWith("retire-latency REFUSED: mention_out_of_cycle: ")], [1, "", true], out.stderr);
});

// killer: scripts/retire-latency.mjs:45 CONST "pub ? INSTANTS.slice(2) : INSTANTS" -> "input.cycle === \"real\" ? INSTANTS : INSTANTS.slice(2)"
test("retire_latency_rehearsal_reports_as_real_and_publication_as_its_tail", async () => {
  const l = await latency(), H = 3_600_000, T: Record<string, string> = { T_a: "2027-01-01T00:00:00Z", T_b: "2027-01-01T09:00:00Z", T_c: "2027-01-04T10:00:00Z", T_d: "2027-01-04T15:00:00Z",
    T_e: "2027-01-05T09:00:00Z", T_f: "2027-01-05T11:00:00Z", T_g: "2027-01-06T12:00:00Z" };
  const input = (cycle: string, instants: Record<string, string>): object => ({ format: "retire-latency-v1", cycle, instants, mention: null }), f = join(TMP, "real.json");
  const report = (cycle: string, instants: Record<string, string>): ReturnType<Latency["report"]> | string => { try { return l.report(input(cycle, instants)); } catch (e) { return String(e); } };
  const shape = (r: ReturnType<Latency["report"]> | string): unknown => (typeof r === "string" ? r : [r.instants, r.steps_ms, r.total_ms, r.ceiling, r.objective]);
  const real = report("real", T), pub = report("publication", Object.fromEntries(Object.entries(T).filter(([k]) => k !== "T_a" && k !== "T_b")));
  assert.ok(typeof real !== "string" && typeof pub !== "string", `the same instants are reported as a real cycle and, from T_c, as a publication: ${JSON.stringify(real)} ${JSON.stringify(pub)}`);
  assert.deepEqual(shape(report("rehearsal", T)), shape(real), "a rehearsal is reported as a real cycle: the same instants T_a to T_g, steps, total, ceiling and objective (the decision segment of D6)");
  assert.deepEqual([pub.instants, pub.steps_ms, pub.total_ms / H], [real.instants.slice(2), real.steps_ms.slice(2), 50], "a publication is the tail of the same cycle, T_c to T_g");
  writeFileSync(f, JSON.stringify(input("real", T)));
  const out = run(LATENCY, f);
  assert.deepEqual([out.status, out.stdout.trimEnd().split("\n").at(-1)], [0, `retire-latency OK: real cycle, T_g - T_a ${String(132 * H)} ms, ceiling held, objective not met (reported only)`], out.stderr);
});

// killer: scripts/retire-latency.mjs:44 CONST "pub && input.mention !== null" -> "input.cycle !== \"real\" && input.mention !== null"
test("retire_latency_rehearsal_carries_a_mention_as_real", async () => {
  const l = await latency(), late: Record<string, string> = { T_a: "2027-01-01T00:00:00Z", T_b: "2027-01-01T09:00:00Z", T_c: "2027-01-04T10:00:00Z", T_d: "2027-01-04T15:00:00Z",
    T_e: "2027-01-05T09:00:00Z", T_f: "2027-01-05T11:00:00Z", T_g: "2027-01-15T00:00:01Z" }, tail = Object.fromEntries(Object.entries(late).filter(([k]) => k !== "T_a" && k !== "T_b"));
  const ceiling = (cycle: string, instants: object = late): unknown => { try { return l.report({ format: "retire-latency-v1", cycle, instants, mention: "JOURNAL line 12" }).ceiling; } catch (e) { return e instanceof l.LatencyError ? e.code : String(e); } };
  const exceeded = { days: 14, exceeded: true, mention: "JOURNAL line 12" };
  assert.deepEqual([ceiling("rehearsal"), ceiling("real"), ceiling("publication", tail)], [exceeded, exceeded, "mention_out_of_cycle"],
    "14 days and 1 s with a mention: a rehearsal carries the mention of its overrun as a real cycle does; only a publication refuses one");
});
