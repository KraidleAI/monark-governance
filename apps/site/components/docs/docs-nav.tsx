"use client";

// apps/site/components/docs/docs-nav.tsx: the sidebar of the documentation section, and its folded twin for narrow screens.
// The sections and the pieces are handed in by the docs layout (a server component that reads the fleet register), so this
// client island carries no register of its own: it only marks the current address. No status is written here.
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface DocsNavLink {
  href: string;
  label: string;
}

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href;
}

function Links({ sections, pieces, piecesHref, pathname }: { sections: readonly DocsNavLink[]; pieces: readonly DocsNavLink[]; piecesHref: string; pathname: string }) {
  return (
    <ul className="d-nav__list">
      {sections.map((s) => (
        <li key={s.href}>
          <Link href={s.href} aria-current={isCurrent(pathname, s.href) ? "page" : undefined} className="d-nav__link">
            {s.label}
          </Link>
          {s.href === piecesHref ? (
            <ul className="d-nav__sub">
              {pieces.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} aria-current={isCurrent(pathname, p.href) ? "page" : undefined} className="d-nav__link d-nav__link--sub">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function DocsNav({ sections, pieces, piecesHref }: { sections: readonly DocsNavLink[]; pieces: readonly DocsNavLink[]; piecesHref: string }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="d-side" aria-label="Documentation">
        <span className="c-label">documentation</span>
        <Links sections={sections} pieces={pieces} piecesHref={piecesHref} pathname={pathname} />
      </nav>
      <details className="d-mobnav">
        <summary>Documentation menu</summary>
        <nav aria-label="Documentation, folded">
          <Links sections={sections} pieces={pieces} piecesHref={piecesHref} pathname={pathname} />
        </nav>
      </details>
    </>
  );
}
