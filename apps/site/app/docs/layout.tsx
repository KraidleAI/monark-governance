import type { ReactNode } from "react";
import "./docs.css";
import { DocsNav } from "@/components/docs/docs-nav";
import { FLEET_AGENTS, countWord, capitalized } from "@/lib/fleet";
import { DOCS_SECTIONS, DOCS_PIECES_ROOT, pieceHref } from "@/lib/docs-nav";

// The documentation shell (server component): the sidebar on the left, the page on the right; on a narrow screen the
// sidebar folds into a menu above the page; in print both disappear. The sections come from lib/docs-nav.ts; the pieces,
// their names and their count come from the fleet register (lib/fleet.ts), so a piece added to or removed from the
// register moves the sidebar with it. The pieces label spells the register's count as a word, never a digit.
export default function DocsLayout({ children }: { children: ReactNode }) {
  const piecesLabel = `The ${countWord(FLEET_AGENTS.length)} pieces`;
  const sections = DOCS_SECTIONS.map((s) => ({ href: s.href, label: s.href === DOCS_PIECES_ROOT ? capitalized(piecesLabel) : s.label }));
  const pieces = FLEET_AGENTS.map((a) => ({ href: pieceHref(a.name), label: a.name }));
  return (
    <div className="d-shell">
      <DocsNav sections={sections} pieces={pieces} piecesHref={DOCS_PIECES_ROOT} />
      <main className="d-main">{children}</main>
    </div>
  );
}
