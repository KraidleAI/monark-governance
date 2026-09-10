// packages/monark/src/cbor-canonique.ts — decoder for the canonical, deterministic CBOR subset
// that Shogen emits. ZERO dependencies, our own code (ADR-M003 D10, ADR-M005 D3, Lot I-a).
//
// It is a faithful TypeScript port of the Rust core of the Shogen repo (read-only, sha-pinned):
//   - crates/shogen-core/src/cbor.rs                 (the subset + strict reader/writer)
//   - crates/shogen-core/src/lot.rs                  (the 7-entry canonical batch dispatch)
//   - crates/shogen-core/src/temoignage_canonique.rs (the seven fields of "03 §1")
//
// SUBSET (RFC 8949 Core Deterministic Encoding Requirements — Shogen ADR-0002). Only:
//   - major 0  unsigned integers, PREFERRED serialization (shortest form);
//   - major 2  byte strings, DEFINITE length;
//   - major 3  text strings, DEFINITE length, valid UTF-8;
//   - major 4  arrays, DEFINITE length (ordered: elements are neither sorted nor de-duplicated);
//   - major 5  maps, DEFINITE length, keys STRICTLY increasing by the bytes of their ENCODED key.
// Everything else is REJECTED, never tolerated: negative integers, tags, floats, simple values,
// indefinite lengths, non-preferred integers, unsorted/duplicate keys, trailing bytes.
//
// CANONICITY is checked exactly as the Rust verifier's examiner_lot does (shogen-verifier/src/lib.rs):
// decode, then re-encode, then assert byte-equality with the input. The strict reader already refuses
// every non-canonical encoding it can name, so a decode SUCCESS already implies canonical form for the
// covered subset; the re-encode/compare is kept for parity with the Rust acceptance property
// (ADR-0011 property (a): encode(decode(b)) === b for every accepted b).
//
// NON-PORT, declared (Lot I-a): the reader ports the cheap SHAPE and IDENTIFIER checks (exact map
// sizes, non-empty arrays, ASCII non-control identifiers, no duplicate residual/attestor, 32-byte
// utterance hash) but does NOT port the subject-canonicity predicate (Shogen ADR-0016, subject.rs,
// ~28 KB). The acceptance authority for the committed fixture is the Shogen verifier's own verdict,
// re-played and committed at fixtures/s3-binance.verdict.txt (see fixtures/PROVENANCE-s3-binance.md).
// The adapter fromShogen (Lot I-b) consumes the structure below; this module only decodes.

/** A named, positioned decode failure. Fail-closed: any deviation is a named error, never a default. */
export class CborError extends Error {
  readonly position: number;
  constructor(message: string, position: number) {
    super(`cbor-canonique: ${message} (at byte ${position})`);
    this.name = "CborError";
    this.position = position;
  }
}

// Major-type prefixes (top three bits) and the additional-information masks.
const MAJOR_MASK = 0xe0;
const INFO_MASK = 0x1f;
const MAJOR_UINT = 0x00;
const MAJOR_BYTES = 0x40;
const MAJOR_TEXT = 0x60;
const MAJOR_ARRAY = 0x80;
const MAJOR_MAP = 0xa0;

const DIRECT_MAX = 23; // argument carried directly in the info bits
const INFO_INDEFINITE = 31;

const U8_MAX = 0xffn;
const U16_MAX = 0xffffn;
const U32_MAX = 0xffff_ffffn;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

const UTF8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const ENC = new TextEncoder();

// Canonical CBOR keys (the names the Shogen spec writes; never invented here).
const KEY_SUBJECT = "subject";
const KEY_ATTESTOR = "attestor";
const KEY_RESIDUAL = "residual";
const KEY_TRANSPORT = "transport";
const KEY_UTTERANCE = "utterance";
const KEY_OBSERVED_AT = "observed_at";
const KEY_TRANSPORT_PROOF = "transport_proof";
const KEY_HASH = "hash";
const KEY_BYTES = "bytes";
const KEY_CLOCK = "clock";
const KEY_INSTANT = "instant";
const KEY_IDENTITY = "identity";
const KEY_KEY = "key";

const FIELD_COUNT = 7;
const EMPREINTE_BYTES = 32; // SHA-256 (Shogen empreinte.rs OCTETS_D_EMPREINTE)

// ---------------------------------------------------------------------------- decoded structure

/** The "dire" — never interpreted at this rank (Shogen 03 §3). */
export interface Utterance {
  /** The SHA-256 empreinte of the exact octets. Always carried (ADR-0005 rule 1). */
  readonly hash: Uint8Array;
  /** The exact octets, only when the class policy retains them (ADR-0005 rule 2). */
  readonly bytes?: Uint8Array;
}

/** The instant of the observation and the clock that produced it (never Shogen's clock). */
export interface ObservedAt {
  readonly clock: string;
  /** The timestamp, carried as data. u64 on the wire, so a bigint here (never lossy). */
  readonly instant: bigint;
}

/** An attestor identity and its pinned key. */
export interface Attestor {
  readonly key: Uint8Array;
  readonly identity: string;
}

/** The canonical witness — the seven fields of Shogen 03 §1, all mandatory. */
export interface Temoignage {
  readonly subject: string;
  readonly attestor: readonly Attestor[];
  readonly residual: readonly string[];
  readonly transport: string;
  readonly utterance: Utterance;
  readonly observed_at: ObservedAt;
  readonly transport_proof: Uint8Array;
}

// ---------------------------------------------------------------------------- preferred-int helpers

/** True iff `arg` is on its shortest form for a `width`-byte argument (preferred serialization). */
function argumentIsPreferred(arg: bigint, width: number): boolean {
  switch (width) {
    case 1:
      return arg > BigInt(DIRECT_MAX);
    case 2:
      return arg > U8_MAX;
    case 4:
      return arg > U16_MAX;
    case 8:
      return arg > U32_MAX;
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------- strict reader

/** A total, bounds-checked cursor. Every operation returns a value or a named CborError. */
class Reader {
  private readonly data: Uint8Array;
  private pos: number;

  constructor(data: Uint8Array) {
    this.data = data;
    this.pos = 0;
  }

  position(): number {
    return this.pos;
  }

  remaining(): number {
    return this.data.length - this.pos;
  }

  done(): boolean {
    return this.pos >= this.data.length;
  }

  /** The next `length` bytes; advances the cursor. Refuses out-of-range (fail-closed). */
  take(length: number): Uint8Array {
    if (length < 0 || length > this.remaining()) {
      throw new CborError(
        `premature end: needed ${String(length)} byte(s), ${String(this.remaining())} left`,
        this.pos,
      );
    }
    const slice = this.data.subarray(this.pos, this.pos + length);
    this.pos += length;
    return slice;
  }

  private byte(): number {
    const b = this.take(1)[0];
    if (b === undefined) {
      throw new CborError("premature end reading one byte", this.pos);
    }
    return b;
  }

  /** Reads a header and returns `{ major, arg }`. Refuses indefinite length, reserved info,
   *  and any argument encoded on more bytes than its preferred (shortest) form. */
  header(): { major: number; arg: bigint } {
    const start = this.pos;
    const first = this.byte();
    const major = first & MAJOR_MASK;
    const info = first & INFO_MASK;
    if (info <= DIRECT_MAX) {
      return { major, arg: BigInt(info) };
    }
    if (info === INFO_INDEFINITE) {
      throw new CborError("indefinite length is not in the canonical subset", start);
    }
    let width: number;
    switch (info) {
      case 24:
        width = 1;
        break;
      case 25:
        width = 2;
        break;
      case 26:
        width = 4;
        break;
      case 27:
        width = 8;
        break;
      default:
        throw new CborError(`reserved additional information ${String(info)}`, start);
    }
    const chunk = this.take(width);
    let arg = 0n;
    for (const b of chunk) {
      arg = (arg << 8n) | BigInt(b);
    }
    if (!argumentIsPreferred(arg, width)) {
      throw new CborError(`non-preferred integer (${String(arg)} on ${String(width)} byte(s))`, start);
    }
    return { major, arg };
  }

  /** Reads a header and requires the expected major type. Returns the argument. */
  typedHeader(expected: number): bigint {
    const start = this.pos;
    const { major, arg } = this.header();
    if (major !== expected) {
      throw new CborError(`unexpected major type 0x${major.toString(16)}, expected 0x${expected.toString(16)}`, start);
    }
    return arg;
  }

  /** Converts a length argument to a memory size, never over-committing before the bytes exist. */
  lengthOf(arg: bigint): number {
    if (arg > MAX_SAFE) {
      throw new CborError(`length ${String(arg)} out of memory range`, this.pos);
    }
    return Number(arg);
  }

  /** Reads a definite-length text string as a UTF-8 JS string (invalid UTF-8 is a named error). */
  text(): string {
    const start = this.pos;
    const len = this.lengthOf(this.typedHeader(MAJOR_TEXT));
    const bytes = this.take(len);
    try {
      return UTF8.decode(bytes);
    } catch {
      throw new CborError(`text is not valid UTF-8 (length ${String(len)})`, start);
    }
  }

  /** Reads a definite-length byte string (copied out, independent of the input buffer). */
  bytes(): Uint8Array {
    const len = this.lengthOf(this.typedHeader(MAJOR_BYTES));
    return this.take(len).slice();
  }
}

// ---------------------------------------------------------------------------- canonical key order

/** Encodes a text key to its canonical CBOR bytes (header + UTF-8), for the sort check. */
function encodeKey(key: string): Uint8Array {
  const out: number[] = [];
  writeText(out, key);
  return Uint8Array.from(out);
}

/** Lexicographic byte comparison: -1, 0, or 1. */
function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i];
    const y = b[i];
    if (x === undefined || y === undefined) break;
    if (x !== y) return x < y ? -1 : 1;
  }
  if (a.length === b.length) return 0;
  return a.length < b.length ? -1 : 1;
}

/** Enforces strictly-increasing map keys on the bytes of their ENCODED key (RFC 8949).
 *  Strict monotonicity establishes key uniqueness by itself — no second "just in case" check. */
class KeyOrder {
  private previous: Uint8Array | null = null;

  next(position: number, key: string): void {
    const encoded = encodeKey(key);
    if (this.previous !== null) {
      const c = compareBytes(encoded, this.previous);
      if (c === 0) {
        throw new CborError(`duplicate map key "${key}"`, position);
      }
      if (c < 0) {
        throw new CborError(`map keys not sorted at "${key}"`, position);
      }
    }
    this.previous = encoded;
  }
}

// ---------------------------------------------------------------------------- field readers

/** An identifier carried in the batch: non-empty, US-ASCII, no control characters. */
function checkIdentifier(text: string, position: number, key: string): void {
  if (text.length === 0) {
    throw new CborError(`empty field "${key}"`, position);
  }
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (c > 0x7f) {
      throw new CborError(`field "${key}" is not US-ASCII`, position);
    }
    if (c < 0x20 || c === 0x7f) {
      throw new CborError(`field "${key}" carries a control character`, position);
    }
  }
}

function readIdentifier(r: Reader, key: string): string {
  const position = r.position();
  const text = r.text();
  checkIdentifier(text, position, key);
  return text;
}

/** `subject`: read as text. The ADR-0016 subject-canonicity predicate is NOT ported (see module doc). */
function readSubject(r: Reader): string {
  return r.text();
}

/** A non-empty array header; returns the element count. */
function arrayHeader(r: Reader, key: string): number {
  const position = r.position();
  const size = r.typedHeader(MAJOR_ARRAY);
  if (size === 0n) {
    throw new CborError(`empty field "${key}"`, position);
  }
  return r.lengthOf(size);
}

/** `residual`: non-empty list of identifiers, emitted order preserved, no duplicate. */
function readResidual(r: Reader): string[] {
  const count = arrayHeader(r, KEY_RESIDUAL);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const position = r.position();
    const id = r.text();
    checkIdentifier(id, position, KEY_RESIDUAL);
    if (out.includes(id)) {
      throw new CborError(`duplicate residual "${id}"`, position);
    }
    out.push(id);
  }
  return out;
}

/** `attestor`: non-empty list of {key, identity} pairs, no exact duplicate. */
function readAttestor(r: Reader): Attestor[] {
  const count = arrayHeader(r, KEY_ATTESTOR);
  const out: Attestor[] = [];
  for (let i = 0; i < count; i++) {
    const mapPos = r.position();
    const entries = r.typedHeader(MAJOR_MAP);
    if (entries !== 2n) {
      throw new CborError(`attestor entry must have 2 keys, got ${String(entries)}`, mapPos);
    }
    const order = new KeyOrder();
    let key: Uint8Array | undefined;
    let identity: string | undefined;
    for (let j = 0; j < 2; j++) {
      const keyPos = r.position();
      const name = r.text();
      order.next(keyPos, name);
      if (name === KEY_KEY) {
        const bytesPos = r.position();
        const value = r.bytes();
        if (value.length === 0) {
          throw new CborError(`empty field "${KEY_KEY}"`, bytesPos);
        }
        key = value;
      } else if (name === KEY_IDENTITY) {
        identity = readIdentifier(r, KEY_IDENTITY);
      } else {
        throw new CborError(`unknown attestor key "${name}"`, keyPos);
      }
    }
    if (key === undefined) throw new CborError(`missing field "${KEY_KEY}"`, mapPos);
    if (identity === undefined) throw new CborError(`missing field "${KEY_IDENTITY}"`, mapPos);
    if (out.some((a) => a.identity === identity && compareBytes(a.key, key) === 0)) {
      throw new CborError(`duplicate attestor "${identity}"`, mapPos);
    }
    out.push({ key, identity });
  }
  return out;
}

/** `utterance`: the empreinte always, the octets by policy (map of 1 or 2 entries). */
function readUtterance(r: Reader): Utterance {
  const mapPos = r.position();
  const entries = r.typedHeader(MAJOR_MAP);
  if (entries !== 1n && entries !== 2n) {
    throw new CborError(`utterance map must have 1 or 2 keys, got ${String(entries)}`, mapPos);
  }
  const order = new KeyOrder();
  let hash: Uint8Array | undefined;
  let bytes: Uint8Array | undefined;
  const total = r.lengthOf(entries);
  for (let j = 0; j < total; j++) {
    const keyPos = r.position();
    const name = r.text();
    order.next(keyPos, name);
    if (name === KEY_HASH) {
      const hashPos = r.position();
      const value = r.bytes();
      if (value.length !== EMPREINTE_BYTES) {
        throw new CborError(`empreinte length ${String(value.length)}, expected ${String(EMPREINTE_BYTES)}`, hashPos);
      }
      hash = value;
    } else if (name === KEY_BYTES) {
      bytes = r.bytes();
    } else {
      throw new CborError(`unknown utterance key "${name}"`, keyPos);
    }
  }
  if (hash === undefined) throw new CborError(`missing field "${KEY_HASH}"`, mapPos);
  return bytes === undefined ? { hash } : { hash, bytes };
}

/** `observed_at`: the clock that dated, and the date it produced. */
function readObservedAt(r: Reader): ObservedAt {
  const mapPos = r.position();
  const entries = r.typedHeader(MAJOR_MAP);
  if (entries !== 2n) {
    throw new CborError(`observed_at map must have 2 keys, got ${String(entries)}`, mapPos);
  }
  const order = new KeyOrder();
  let clock: string | undefined;
  let instant: bigint | undefined;
  for (let j = 0; j < 2; j++) {
    const keyPos = r.position();
    const name = r.text();
    order.next(keyPos, name);
    if (name === KEY_CLOCK) {
      clock = readIdentifier(r, KEY_CLOCK);
    } else if (name === KEY_INSTANT) {
      instant = r.typedHeader(MAJOR_UINT);
    } else {
      throw new CborError(`unknown observed_at key "${name}"`, keyPos);
    }
  }
  if (clock === undefined) throw new CborError(`missing field "${KEY_CLOCK}"`, mapPos);
  if (instant === undefined) throw new CborError(`missing field "${KEY_INSTANT}"`, mapPos);
  return { clock, instant };
}

// ---------------------------------------------------------------------------- decode + encode

/** Decodes a canonical Shogen witness batch and asserts round-trip byte-equality (canonicity).
 *  Throws a named CborError on any deviation. Never mutates the input. */
export function decodeTemoignageCbor(input: Uint8Array): Temoignage {
  if (input.length === 0) {
    throw new CborError("empty input", 0);
  }
  const r = new Reader(input);

  const mapPos = r.position();
  const size = r.typedHeader(MAJOR_MAP);
  if (size !== BigInt(FIELD_COUNT)) {
    throw new CborError(`top-level map must have ${String(FIELD_COUNT)} entries, got ${String(size)}`, mapPos);
  }

  let subject: string | undefined;
  let attestor: Attestor[] | undefined;
  let residual: string[] | undefined;
  let transport: string | undefined;
  let utterance: Utterance | undefined;
  let observed_at: ObservedAt | undefined;
  let transport_proof: Uint8Array | undefined;
  const order = new KeyOrder();

  for (let i = 0; i < FIELD_COUNT; i++) {
    const keyPos = r.position();
    const key = r.text();
    order.next(keyPos, key);
    switch (key) {
      case KEY_SUBJECT:
        subject = readSubject(r);
        break;
      case KEY_ATTESTOR:
        attestor = readAttestor(r);
        break;
      case KEY_RESIDUAL:
        residual = readResidual(r);
        break;
      case KEY_TRANSPORT:
        transport = readIdentifier(r, KEY_TRANSPORT);
        break;
      case KEY_UTTERANCE:
        utterance = readUtterance(r);
        break;
      case KEY_OBSERVED_AT:
        observed_at = readObservedAt(r);
        break;
      case KEY_TRANSPORT_PROOF:
        transport_proof = r.bytes();
        break;
      default:
        throw new CborError(`unknown top-level key "${key}"`, keyPos);
    }
  }

  if (!r.done()) {
    throw new CborError(`${String(r.remaining())} trailing byte(s) after the batch`, r.position());
  }

  if (subject === undefined) throw new CborError(`missing field "${KEY_SUBJECT}"`, mapPos);
  if (attestor === undefined) throw new CborError(`missing field "${KEY_ATTESTOR}"`, mapPos);
  if (residual === undefined) throw new CborError(`missing field "${KEY_RESIDUAL}"`, mapPos);
  if (transport === undefined) throw new CborError(`missing field "${KEY_TRANSPORT}"`, mapPos);
  if (utterance === undefined) throw new CborError(`missing field "${KEY_UTTERANCE}"`, mapPos);
  if (observed_at === undefined) throw new CborError(`missing field "${KEY_OBSERVED_AT}"`, mapPos);
  if (transport_proof === undefined) throw new CborError(`missing field "${KEY_TRANSPORT_PROOF}"`, mapPos);

  const temoignage: Temoignage = {
    subject,
    attestor,
    residual,
    transport,
    utterance,
    observed_at,
    transport_proof,
  };

  // Canonicity, exactly as examiner_lot: encode(decode(b)) must equal b, byte for byte.
  const reencoded = encodeTemoignageCanonical(temoignage);
  if (compareBytes(reencoded, input) !== 0) {
    let at = 0;
    while (at < input.length && at < reencoded.length && input[at] === reencoded[at]) at++;
    throw new CborError("re-encoding diverges — the batch decodes but is not its own canonical form", at);
  }

  return temoignage;
}

/** Writes a header (major-type prefix + argument) in preferred (shortest) serialization. */
function writeHeader(out: number[], major: number, arg: bigint): void {
  if (arg <= BigInt(DIRECT_MAX)) {
    out.push(major | Number(arg));
  } else if (arg <= U8_MAX) {
    out.push(major | 24, Number(arg));
  } else if (arg <= U16_MAX) {
    out.push(major | 25, Number((arg >> 8n) & 0xffn), Number(arg & 0xffn));
  } else if (arg <= U32_MAX) {
    out.push(major | 26);
    for (let shift = 24n; shift >= 0n; shift -= 8n) out.push(Number((arg >> shift) & 0xffn));
  } else {
    out.push(major | 27);
    for (let shift = 56n; shift >= 0n; shift -= 8n) out.push(Number((arg >> shift) & 0xffn));
  }
}

function writeText(out: number[], text: string): void {
  const bytes = ENC.encode(text);
  writeHeader(out, MAJOR_TEXT, BigInt(bytes.length));
  for (const b of bytes) out.push(b);
}

function writeBytes(out: number[], bytes: Uint8Array): void {
  writeHeader(out, MAJOR_BYTES, BigInt(bytes.length));
  for (const b of bytes) out.push(b);
}

/** Encodes a witness in canonical form. Total: defined on every value of the type, no I/O.
 *  Mirrors encoder_temoignage_canonique (temoignage_canonique.rs): fixed canonical key order. */
export function encodeTemoignageCanonical(t: Temoignage): Uint8Array {
  const out: number[] = [];
  writeHeader(out, MAJOR_MAP, BigInt(FIELD_COUNT));

  writeText(out, KEY_SUBJECT);
  writeText(out, t.subject);

  writeText(out, KEY_ATTESTOR);
  writeHeader(out, MAJOR_ARRAY, BigInt(t.attestor.length));
  for (const a of t.attestor) {
    writeHeader(out, MAJOR_MAP, 2n);
    writeText(out, KEY_KEY);
    writeBytes(out, a.key);
    writeText(out, KEY_IDENTITY);
    writeText(out, a.identity);
  }

  writeText(out, KEY_RESIDUAL);
  writeHeader(out, MAJOR_ARRAY, BigInt(t.residual.length));
  for (const id of t.residual) writeText(out, id);

  writeText(out, KEY_TRANSPORT);
  writeText(out, t.transport);

  writeText(out, KEY_UTTERANCE);
  const utteranceEntries = t.utterance.bytes === undefined ? 1n : 2n;
  writeHeader(out, MAJOR_MAP, utteranceEntries);
  writeText(out, KEY_HASH);
  writeBytes(out, t.utterance.hash);
  if (t.utterance.bytes !== undefined) {
    writeText(out, KEY_BYTES);
    writeBytes(out, t.utterance.bytes);
  }

  writeText(out, KEY_OBSERVED_AT);
  writeHeader(out, MAJOR_MAP, 2n);
  writeText(out, KEY_CLOCK);
  writeText(out, t.observed_at.clock);
  writeText(out, KEY_INSTANT);
  writeHeader(out, MAJOR_UINT, t.observed_at.instant);

  writeText(out, KEY_TRANSPORT_PROOF);
  writeBytes(out, t.transport_proof);

  return Uint8Array.from(out);
}
