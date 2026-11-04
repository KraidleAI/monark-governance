/**
 * Harness — the paper executor (step 8 of ROADMAP.md). A signal goes through HIKAE's gate and Genkan's kernel and out as an
 * order filled on paper; every step goes into a journal, and the journal replays.
 *
 * Not served: no tool, no route. It calls `judge` as the HTTP mirror serves it (handleJsonMirror, in process, no socket), with
 * the caller's instant (`at_ms`) as the clock and the kernel runner it is handed: the same input schema, gate, kernel and output
 * check as a served call. It reads no clock, opens no socket, writes no file and places no order on any venue: the journal is
 * text that the caller keeps.
 *
 * State: the size open on each venue and asset; the amount engaged on each asset, the sum of the OPEN amounts filled since the
 * journal began (an EXIT does not lower it); the order ids already submitted; the last instant. The kernel holds its cap to one
 * order (apps/genkan/kernel/Genkan/Judge.lean); the executor hands it, as the cap of each asset, the rest of that asset's total
 * (the total less what is engaged), so the cap holds all the orders of the journal together, with the kernel unchanged. The
 * totals are the caller's: on paper a trial value, the real amount being the founder's decision.
 *
 * A step, in this order: an order id already submitted is refused (`duplicate_id`), then an instant before the last
 * (`time_backwards`), then any kind but OPEN and EXIT (`kind_not_paper`), all before the gate. Then `judge` runs, and a refusal of
 * the engine (its input schema, or a tool error of the gate or of the frames) is journaled with its code. A judged order fills:
 * an allowed OPEN its amount; an allowed EXIT, which judge marks reduce_only, at most the size open on its venue and asset, never
 * more; a denied order nothing. Every journaled step takes its id, whatever its outcome: one id, one decision. An allow that
 * breaks the kernel's rules as the executor reads them (an OPEN without commit or above the rest of its total, an EXIT that is
 * not reduce_only), or an answer of the engine that is neither a verdict nor a refusal, stops the executor (PaperHalt): it
 * journals nothing more. A submission that is not one (PaperInputError) is refused and journals nothing.
 *
 * Journal: one line per step, each the canonical writing of contract 1.1.0 (canonicalJson), ended by a newline. Line 1 is the
 * header (the format and the config); each step carries its seq, the sha256 of the line before it, the submission, the limits
 * handed to judge, the refusal or judge's output, the fill and the state after the step. replayPaperJournal reads it back,
 * recomputes each step from its submission with this same code, the gate and the kernel, and refuses at the first line whose
 * bytes differ (PaperReplayError names the line and the field). The replay holds each line to the engine; a journal rewritten
 * whole and consistently, or cut at its end, still replays: keep its head (the sha256 of its last line) apart to hold it to that.
 */
import { createHash } from "node:crypto";
import { canonicalJson, type AttestedPrice, type CanonicalValue, type Prediction } from "@monark/contracts";
import { handleJsonMirror } from "./http.ts";
import type { HarnessParams } from "./tools/gate.ts";
import { JUDGE_DECIMAL_PATTERN, JUDGE_LIST_MAX, JUDGE_NAME_PATTERN, type JudgeLimits, type JudgeOrder, type JudgeOutput, type KernelRunner } from "./tools/judge.ts";

/** The format of a journal, written in its header. */
export const PAPER_JOURNAL_FORMAT = "monark-paper-journal-v1";
/** An order id: 1 to 128 characters of 0-9, a-z, `:`, `.`, `_`, `/`, `@`, `-`, as the names of the frames. */
export const PAPER_ID_PATTERN = JUDGE_NAME_PATTERN;
/** The kinds the executor fills on paper; any other is refused before the gate. */
export const PAPER_KINDS: readonly JudgeOrder["kind"][] = ["OPEN", "EXIT"];
/** The URL of the in-process call: the mirror reads its path only, and no request leaves the process. */
const JUDGE_URL = "http://paper.invalid/judge";

/** The total of an asset: the most that all the OPEN orders of a journal may engage on it, a decimal string. */
export interface PaperTotal {
  readonly asset: string;
  readonly total: string;
}

/** The executor's config: the venues an order may target, and the assets it may move with their totals. */
export interface PaperConfig {
  readonly venues: readonly string[];
  readonly totals: readonly PaperTotal[];
}

/** One submission: the caller's order id and instant (ms since the epoch), the gate's envelope, and the order. */
export interface PaperSubmission {
  readonly id: string;
  readonly at_ms: number;
  readonly prediction: Prediction;
  readonly params: HarnessParams;
  readonly attested?: AttestedPrice;
  readonly order: JudgeOrder;
}

/** A refused step: by the executor (its own codes) or by the engine (the codes of the served refusals). */
export interface PaperRefusal {
  readonly by: "executor" | "engine";
  readonly code: string;
  readonly message: string;
}

/** The order filled on paper: what it asked for and what was filled, decimal strings. */
export interface PaperFill {
  readonly kind: "OPEN" | "EXIT";
  readonly venue: string;
  readonly asset: string;
  readonly requested: string;
  readonly filled: string;
}

/** The size open on a venue and an asset, a decimal string above 0. */
export interface PaperPosition {
  readonly venue: string;
  readonly asset: string;
  readonly size: string;
}

/** The amount engaged on an asset since the journal began, a decimal string. */
export interface PaperEngaged {
  readonly asset: string;
  readonly amount: string;
}

/** The state after a step: the open positions, by venue then asset, and what is engaged on each asset of the config. */
export interface PaperState {
  readonly positions: readonly PaperPosition[];
  readonly engaged: readonly PaperEngaged[];
}

/** A step of the journal. `limits` is null when judge did not run; exactly one of `refusal` and `judge` is null. */
export interface PaperEntry {
  readonly seq: number;
  readonly prev: string;
  readonly submission: PaperSubmission;
  readonly limits: JudgeLimits | null;
  readonly refusal: PaperRefusal | null;
  readonly judge: JudgeOutput | null;
  readonly fill: PaperFill | null;
  readonly state: PaperState;
}

/** What a replay read: the steps, the head (the sha256 of the last line) and the state after the last step. */
export interface PaperReplay {
  readonly steps: number;
  readonly head: string;
  readonly state: PaperState;
}

/** The executor stopped: an allow it cannot square with the kernel's rules, or an engine answer that it cannot read. */
export class PaperHalt extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaperHalt";
  }
}

/** A submission that is not one: refused, and nothing is journaled. */
export class PaperInputError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = "PaperInputError";
  }
}

/** The first line of a journal that does not replay, and its first field that differs (`line` for a line that is not an entry). */
export class PaperReplayError extends Error {
  readonly line: number;
  readonly field: string;
  constructor(line: number, field: string, message: string) {
    super(`journal line ${String(line)}, ${field}: ${message}`);
    this.name = "PaperReplayError";
    this.line = line;
    this.field = field;
  }
}

const NAME = new RegExp(JUDGE_NAME_PATTERN);
const DECIMAL = new RegExp(JUDGE_DECIMAL_PATTERN);
/** The fields of an entry, in the order a replay compares them. */
const ENTRY_FIELDS = ["seq", "prev", "submission", "limits", "refusal", "judge", "fill", "state"] as const;

const isRecord = (v: unknown): v is Readonly<Record<string, unknown>> => typeof v === "object" && v !== null && !Array.isArray(v);
const isList = (v: unknown): v is readonly unknown[] => Array.isArray(v);
const isName = (v: unknown): v is string => typeof v === "string" && NAME.test(v);
const sha256 = (text: string): string => createHash("sha256").update(text, "utf8").digest("hex");
const messageOf = (e: unknown): string => (e instanceof Error ? e.message : String(e));
/** The canonical writing of a value this module builds or reads from JSON. */
const written = (v: unknown): string => canonicalJson(v as CanonicalValue);

/** The object holds every required key, and no key that is neither required nor optional. */
function keysAre(o: Readonly<Record<string, unknown>>, required: readonly string[], optional: readonly string[] = []): boolean {
  return required.every((k) => Object.hasOwn(o, k)) && Object.keys(o).every((k) => required.includes(k) || optional.includes(k));
}

function configRefusal(why: string): never {
  throw new RangeError(`invalid paper config: ${why}`);
}

/** A config read from JSON: distinct venue names, and distinct assets with their totals, at most JUDGE_LIST_MAX of each. */
export function readPaperConfig(v: unknown): PaperConfig {
  if (!isRecord(v) || !keysAre(v, ["venues", "totals"])) configRefusal("expected an object with venues and totals, and no other key");
  const venues = v["venues"];
  const totals = v["totals"];
  if (!isList(venues) || venues.length > JUDGE_LIST_MAX || !venues.every(isName) || new Set(venues).size !== venues.length) {
    configRefusal(`expected at most ${String(JUDGE_LIST_MAX)} distinct venue names of the frames`);
  }
  if (!isList(totals) || totals.length > JUDGE_LIST_MAX) configRefusal(`expected a list of at most ${String(JUDGE_LIST_MAX)} totals`);
  const read = totals.map((t, i): PaperTotal => {
    if (!isRecord(t) || !keysAre(t, ["asset", "total"]) || !isName(t["asset"])) configRefusal(`totals[${String(i)}]: expected an asset name of the frames and a total`);
    const total = t["total"];
    if (typeof total !== "string" || !DECIMAL.test(total)) configRefusal(`totals[${String(i)}].total: expected the decimal string of an integer`);
    return { asset: t["asset"], total };
  });
  if (new Set(read.map((t) => t.asset)).size !== read.length) configRefusal("an asset is named twice in totals");
  return { venues: [...venues], totals: read };
}

/** A position of the book: its venue, its asset, and its size. */
interface Position {
  readonly venue: string;
  readonly asset: string;
  readonly size: bigint;
}

/** The executor's state, and where the journal stands. Only a step's commit changes it. */
interface Book {
  readonly config: PaperConfig;
  readonly totals: ReadonlyMap<string, bigint>;
  readonly ids: Set<string>;
  positions: ReadonlyMap<string, Position>;
  engaged: ReadonlyMap<string, bigint>;
  lastAt: number | null;
  seq: number;
  head: string;
}

function openBook(config: PaperConfig, header: string): Book {
  return {
    config,
    totals: new Map(config.totals.map((t) => [t.asset, BigInt(t.total)])),
    ids: new Set(),
    positions: new Map(),
    engaged: new Map(config.totals.map((t) => [t.asset, 0n])),
    lastAt: null,
    seq: 0,
    head: sha256(header),
  };
}

const positionKey = (venue: string, asset: string): string => `${venue} ${asset}`;
const byName = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function stateOf(config: PaperConfig, positions: ReadonlyMap<string, Position>, engaged: ReadonlyMap<string, bigint>): PaperState {
  return {
    positions: [...positions.values()]
      .map((p) => ({ venue: p.venue, asset: p.asset, size: String(p.size) }))
      .sort((a, b) => byName(a.venue, b.venue) || byName(a.asset, b.asset)),
    engaged: config.totals.map((t) => ({ asset: t.asset, amount: String(engaged.get(t.asset) ?? 0n) })),
  };
}

/** The limits handed to judge: the config's venues, and for each asset the rest of its total as its cap. */
function limitsOf(book: Book): JudgeLimits {
  return {
    venues: [...book.config.venues],
    assets: book.config.totals.map((t) => ({ asset: t.asset, cap: String(BigInt(t.total) - (book.engaged.get(t.asset) ?? 0n)) })),
  };
}

/** A submission read from JSON. */
interface Submitted {
  readonly json: Readonly<Record<string, unknown>>;
  readonly id: string;
  readonly at: number;
}

function readSubmission(v: unknown): Submitted {
  if (!isRecord(v) || !keysAre(v, ["id", "at_ms", "prediction", "params", "order"], ["attested"])) {
    throw new PaperInputError("a paper submission is an object with id, at_ms, prediction, params, order and an optional attested, and no other key");
  }
  const id = v["id"];
  const at = v["at_ms"];
  if (!isName(id)) throw new PaperInputError(`a paper submission's id is 1 to 128 characters of 0-9, a-z, ':', '.', '_', '/', '@', '-' (got ${JSON.stringify(id)})`);
  if (typeof at !== "number" || !Number.isSafeInteger(at) || at < 0) throw new PaperInputError(`a paper submission's at_ms is a safe integer, 0 or above (got ${JSON.stringify(at)})`);
  try {
    written(v);
  } catch (e) {
    throw new PaperInputError(`a paper submission is written canonically (RFC 7493): ${messageOf(e)}`);
  }
  return { json: v, id, at };
}

/** judge on the submission's envelope and order, under the limits, as the HTTP mirror serves it: its verdict, or its refusal. */
async function judged(s: Submitted, limits: JudgeLimits, kernel: KernelRunner): Promise<{ readonly judge: JudgeOutput } | { readonly refusal: PaperRefusal }> {
  const body = JSON.stringify({
    prediction: s.json["prediction"],
    params: s.json["params"],
    ...(Object.hasOwn(s.json, "attested") ? { attested: s.json["attested"] } : {}),
    order: s.json["order"],
    limits,
  });
  const response = await handleJsonMirror(new Request(JUDGE_URL, { method: "POST", headers: { "content-type": "application/json" }, body }), () => s.at, kernel);
  const answer: unknown = await response.json();
  const content = isRecord(answer) ? answer["structuredContent"] : undefined;
  if (response.status === 200 && isRecord(content)) return { judge: content as unknown as JudgeOutput };
  const code = isRecord(answer) ? answer["code"] : undefined;
  const message = isRecord(answer) ? answer["message"] : undefined;
  if (response.status === 400 && typeof code === "string" && typeof message === "string") return { refusal: { by: "engine", code, message } };
  throw new PaperHalt(`the engine answered ${String(response.status)} with neither a verdict nor a refusal`);
}

/** What a step leaves: its fill, and the positions and the amounts engaged after it. */
interface After {
  readonly fill: PaperFill | null;
  readonly positions: ReadonlyMap<string, Position>;
  readonly engaged: ReadonlyMap<string, bigint>;
}

/** The fill of a judged order (an OPEN or an EXIT, its fields held by judge's input schema). */
function fillOf(book: Book, id: string, order: JudgeOrder, out: JudgeOutput): After {
  if (out.kernel_verdict !== "allow") return { fill: null, positions: book.positions, engaged: book.engaged };
  const amount = BigInt(order.amount);
  const key = positionKey(order.target, order.asset);
  const open = book.positions.get(key)?.size ?? 0n;
  const positions = new Map(book.positions);
  if (order.kind === "EXIT") {
    if (!out.reduce_only) throw new PaperHalt(`the kernel allowed the EXIT '${id}' and judge did not mark it reduce_only`);
    const filled = amount < open ? amount : open;
    if (open === filled) positions.delete(key);
    else positions.set(key, { venue: order.target, asset: order.asset, size: open - filled });
    return { fill: { kind: "EXIT", venue: order.target, asset: order.asset, requested: order.amount, filled: String(filled) }, positions, engaged: book.engaged };
  }
  const total = book.totals.get(order.asset);
  const engaged = book.engaged.get(order.asset) ?? 0n;
  if (order.kind !== "OPEN" || out.decision?.action !== "commit") throw new PaperHalt(`the kernel allowed the ${order.kind} '${id}' without a commit of the gate`);
  if (total === undefined || amount > total - engaged) throw new PaperHalt(`the kernel allowed the OPEN '${id}' above the rest of the total of '${order.asset}'`);
  positions.set(key, { venue: order.target, asset: order.asset, size: open + amount });
  const after = new Map(book.engaged);
  after.set(order.asset, engaged + amount);
  return { fill: { kind: "OPEN", venue: order.target, asset: order.asset, requested: order.amount, filled: order.amount }, positions, engaged: after };
}

/** A step computed and written, not yet applied: `commit` applies it to the book. */
interface Step {
  readonly entry: PaperEntry;
  readonly line: string;
  readonly commit: () => void;
}

/** One step on the book, from a submission read from JSON. It changes nothing until its commit. */
async function step(book: Book, raw: unknown, kernel: KernelRunner): Promise<Step> {
  const s = readSubmission(raw);
  const order = s.json["order"];
  const kind = isRecord(order) ? order["kind"] : undefined;
  const refusal = (code: string, message: string): PaperRefusal => ({ by: "executor", code, message });
  let limits: JudgeLimits | null = null;
  let refused: PaperRefusal | null = null;
  let judge: JudgeOutput | null = null;
  let after: After = { fill: null, positions: book.positions, engaged: book.engaged };
  if (book.ids.has(s.id)) refused = refusal("duplicate_id", `the order id '${s.id}' was submitted before: one id, one decision`);
  else if (book.lastAt !== null && s.at < book.lastAt) refused = refusal("time_backwards", `at_ms ${String(s.at)} is before the last instant, ${String(book.lastAt)}`);
  else if (!PAPER_KINDS.some((k) => k === kind)) refused = refusal("kind_not_paper", `the paper executor fills OPEN and EXIT only (got ${JSON.stringify(kind) ?? "no kind"})`);
  else {
    limits = limitsOf(book);
    const answer = await judged(s, limits, kernel);
    if ("refusal" in answer) refused = answer.refusal;
    else {
      judge = answer.judge;
      after = fillOf(book, s.id, order as JudgeOrder, judge);
    }
  }
  const entry: PaperEntry = {
    seq: book.seq + 1,
    prev: book.head,
    submission: s.json as unknown as PaperSubmission,
    limits,
    refusal: refused,
    judge,
    fill: after.fill,
    state: stateOf(book.config, after.positions, after.engaged),
  };
  const line = written(entry);
  const commit = (): void => {
    book.ids.add(s.id);
    book.lastAt = book.lastAt === null ? s.at : Math.max(book.lastAt, s.at);
    book.seq += 1;
    book.head = sha256(line);
    book.positions = after.positions;
    book.engaged = after.engaged;
  };
  return { entry, line, commit };
}

/**
 * The paper executor: it takes submissions one at a time, in the order of the calls to `submit`, and journals each step. It
 * starts no process itself: the kernel runner is handed in (src/kernel.ts runs the built kernel).
 */
export class PaperExecutor {
  readonly #kernel: KernelRunner;
  readonly #book: Book;
  readonly #lines: string[] = [];
  #queue: Promise<unknown> = Promise.resolve();
  #halted: string | null = null;

  constructor(config: PaperConfig, kernel: KernelRunner) {
    const read = readPaperConfig(config);
    const header = written({ journal: PAPER_JOURNAL_FORMAT, config: read });
    this.#kernel = kernel;
    this.#book = openBook(read, header);
    this.#lines.push(header);
  }

  /** Runs one step after the steps submitted before it, and resolves to its entry once it is journaled. */
  submit(submission: PaperSubmission): Promise<PaperEntry> {
    const run = this.#queue.then(() => this.#run(submission));
    this.#queue = run.catch(() => undefined);
    return run;
  }

  async #run(submission: PaperSubmission): Promise<PaperEntry> {
    if (this.#halted !== null) throw new PaperHalt(`the executor has stopped: ${this.#halted}`);
    let raw: unknown;
    try {
      raw = JSON.parse(JSON.stringify(submission));
    } catch (e) {
      throw new PaperInputError(`a paper submission is a JSON value: ${messageOf(e)}`);
    }
    try {
      const s = await step(this.#book, raw, this.#kernel);
      s.commit();
      this.#lines.push(s.line);
      return s.entry;
    } catch (e) {
      if (!(e instanceof PaperInputError)) this.#halted = messageOf(e);
      throw e;
    }
  }

  /** The journal: its header, then a line a step, each ended by a newline. */
  journal(): string {
    return this.#lines.map((l) => `${l}\n`).join("");
  }

  /** The sha256 of the last line of the journal. */
  head(): string {
    return this.#book.head;
  }

  /** The state after the last step. */
  state(): PaperState {
    return stateOf(this.#book.config, this.#book.positions, this.#book.engaged);
  }
}

/** Two values read from JSON, compared by their canonical writing (an absent key compares only to an absent key). */
function same(a: unknown, b: unknown): boolean {
  return a === undefined || b === undefined ? a === b : written(a) === written(b);
}

/** A line of the journal read back: a JSON object written canonically. */
function readLine(n: number, line: string): Readonly<Record<string, unknown>> {
  let v: unknown;
  try {
    v = JSON.parse(line);
  } catch {
    throw new PaperReplayError(n, "line", "not JSON");
  }
  if (!isRecord(v)) throw new PaperReplayError(n, "line", "not a JSON object");
  let canonical: string;
  try {
    canonical = written(v);
  } catch (e) {
    throw new PaperReplayError(n, "line", `not written canonically: ${messageOf(e)}`);
  }
  if (canonical !== line) throw new PaperReplayError(n, "line", "not written canonically");
  return v;
}

/**
 * Replays a journal: reads its header, then recomputes each step from its submission (the gate and the kernel run again,
 * through `kernel`) and holds the recorded line to the recomputed one, byte for byte. The first line that differs is refused
 * (PaperReplayError: the line, and its first field that differs). Resolves to the steps, the head and the state.
 */
export async function replayPaperJournal(text: string, kernel: KernelRunner): Promise<PaperReplay> {
  const lines = text.split("\n");
  if (lines.pop() !== "") throw new PaperReplayError(lines.length + 1, "line", "the journal does not end with a newline");
  const first = lines[0];
  if (first === undefined) throw new PaperReplayError(1, "line", "the journal has no header");
  const header = readLine(1, first);
  if (!keysAre(header, ["journal", "config"]) || header["journal"] !== PAPER_JOURNAL_FORMAT) throw new PaperReplayError(1, "journal", `not a header of ${PAPER_JOURNAL_FORMAT}`);
  let config: PaperConfig;
  try {
    config = readPaperConfig(header["config"]);
  } catch (e) {
    throw new PaperReplayError(1, "config", messageOf(e));
  }
  const book = openBook(config, first);
  for (let i = 1; i < lines.length; i++) {
    const n = i + 1;
    const line = lines[i] ?? "";
    const recorded = readLine(n, line);
    let s: Step;
    try {
      s = await step(book, recorded["submission"], kernel);
    } catch (e) {
      throw new PaperReplayError(n, e instanceof PaperInputError ? "submission" : "step", `the step does not recompute: ${messageOf(e)}`);
    }
    if (s.line !== line) {
      const fresh = s.entry as unknown as Readonly<Record<string, unknown>>;
      const field = [...ENTRY_FIELDS, ...Object.keys(recorded)].find((f) => !same(recorded[f], fresh[f])) ?? "line";
      throw new PaperReplayError(n, field, "the recorded step is not the one that the engine and the executor compute from its submission");
    }
    s.commit();
  }
  return { steps: lines.length - 1, head: book.head, state: stateOf(book.config, book.positions, book.engaged) };
}
