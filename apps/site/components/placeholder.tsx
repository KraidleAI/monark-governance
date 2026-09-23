// apps/site/components/placeholder.tsx — a NAMED placeholder (lot SITE-CHARTE-C; decision 146).
// A value that is not served yet is never typed by hand: the page shows the placeholder's NAME in clear plus its
// state word ("upcoming" by default; "to be published" / "to be exported" / "to be created" / "to be decided"
// where the mock says so). The real value arrives later from a served file (state.json, timeline.jsonl) or the
// anchors register — at which point the placeholder is replaced by a read, never by a literal.
// Register strings (lib/fleet.ts) may carry a placeholder token `<<name>>`; RegisterText renders such a token
// as a Placeholder and any other string as plain text, so the register stays the single source.

export type PlaceholderState = "upcoming" | "to be published" | "to be exported" | "to be created" | "to be decided";

const TOKEN = /^<<([A-Za-z0-9_]+)>>$/;

/** The placeholder name carried by a register token `<<name>>`, or null for an ordinary string. */
export function placeholderName(s: string): string | null {
  const m = TOKEN.exec(s);
  return m && m[1] !== undefined ? m[1] : null;
}

export function Placeholder({ name, state = "upcoming" }: { name: string; state?: PlaceholderState }) {
  return (
    <span className="c-ph" title={`${name}: ${state}, never a typed value`}>
      <span>{name}</span>
      <span className="c-ph__state">{state}</span>
    </span>
  );
}

/** A register string: a `<<name>>` token renders as a named Placeholder, anything else as text. */
export function RegisterText({ text }: { text: string }) {
  const name = placeholderName(text);
  return name === null ? <>{text}</> : <Placeholder name={name} />;
}
