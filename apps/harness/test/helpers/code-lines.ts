/** A line that opens a comment: //, /* or a continuation *. */
export const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;
/** The text without its comment lines, so a literal in a comment is no thrower for the ratchet of kata-path.test.ts. */
export function codeLines(text: string): string {
  return text.split("\n").filter((l) => !COMMENT_LINE.test(l)).join("\n");
}
