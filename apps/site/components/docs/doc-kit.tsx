// apps/site/components/docs/doc-kit.tsx: the building blocks of a documentation page (server components). A page is a
// header, an "on this page" list of anchors, sections with an anchor each, figures (one schema each, with a caption),
// callouts, JSON blocks, citations and the previous and next sections. Nothing here carries a status, a count or a
// figure of its own: a status pill takes the register's value, a JSON block takes an object read from committed, hashed
// data and prints it with JSON.stringify, and a citation prints the entry of the committed bibliography.
import type { ReactNode } from "react";
import Link from "next/link";
import { loadDocsReferences, referenceById, docsRepoRoot, type DocReference, type DocsReferences } from "@/lib/docs-references-load";
import { neighbours } from "@/lib/docs-nav";

/** The eyebrow, the title and the lede of a page; an optional pill (a register status passed in by the page). */
export function DocHeader({ eyebrow, title, pill, children }: { eyebrow: string; title: ReactNode; pill?: ReactNode; children?: ReactNode }) {
  return (
    <header className="d-head">
      <div className="d-eyebrow">
        <span className="c-label">{eyebrow}</span>
        {pill ?? null}
      </div>
      <h1 className="d-h1">{title}</h1>
      {children ? <div className="d-lede">{children}</div> : null}
    </header>
  );
}

/** A register status as a pill: the value is the register's (a.status or p.status), never a typed word. */
export function StatusPill({ status }: { status: "built" | "upcoming" }) {
  return <span className={status === "built" ? "c-pill c-pill--built" : "c-pill c-pill--upcoming"}>{status}</span>;
}

export interface TocItem {
  id: string;
  label: string;
}

/** The anchors of the page, in order. */
export function Toc({ items }: { items: readonly TocItem[] }) {
  return (
    <nav className="d-toc" aria-label="On this page">
      <span className="c-label">on this page</span>
      <ol>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`}>{it.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** A section with its anchor. The heading is a link to itself, so a reader can copy the address of any section. */
export function DocSection({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="d-section" id={id} aria-labelledby={`h-${id}`}>
      <h2 className="d-h2" id={`h-${id}`}>
        <a href={`#${id}`} className="d-anchor">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

/** A schema with its caption. The drawing scrolls sideways on a narrow screen instead of shrinking below legibility. */
export function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="d-figure">
      <div className="d-figure__scroll">{children}</div>
      <figcaption className="d-caption">{caption}</figcaption>
    </figure>
  );
}

/** A boxed note: what a part is not, a limit, a state today. */
export function Callout({ tone = "note", title, children }: { tone?: "note" | "limit" | "today"; title: ReactNode; children: ReactNode }) {
  return (
    <aside className={`d-callout d-callout--${tone}`}>
      <div className="d-callout__title">{title}</div>
      <div className="d-callout__body">{children}</div>
    </aside>
  );
}

/** A JSON value read from committed, hashed data, printed as it is. The caption says where it comes from. */
export function JsonBlock({ value, caption }: { value: unknown; caption: ReactNode }) {
  return (
    <figure className="d-json">
      <figcaption className="d-json__caption">{caption}</figcaption>
      <pre className="c-code d-json__pre">{JSON.stringify(value, null, 2)}</pre>
    </figure>
  );
}

let cachedRefs: DocsReferences | null = null;
/** The committed bibliography, read once per build (fail-closed loader). */
export function docsReferences(): DocsReferences {
  cachedRefs ??= loadDocsReferences(docsRepoRoot());
  return cachedRefs;
}

/** An author-year citation of a work of the bibliography, linked to its entry on the research page. */
export function Cite({ refId }: { refId: string }) {
  const r = referenceById(docsReferences(), refId);
  return (
    <Link href={`/docs/research#ref-${r.id}`} className="d-cite">
      {r.authors} ({r.year})
    </Link>
  );
}

/** The works a page cites, as a short list with their reading level. */
export function RefList({ refIds }: { refIds: readonly string[] }) {
  const refs = docsReferences();
  const list: DocReference[] = refIds.map((id) => referenceById(refs, id));
  return (
    <ul className="d-reflist">
      {list.map((r) => (
        <li key={r.id}>
          <span className="d-reflist__who">
            {r.authors} ({r.year})
          </span>{" "}
          {r.title !== null ? <em>{r.title}</em> : <span className="c-muted">{r.title_note}</span>}. {r.venue}.{" "}
          <span className="c-tag">{r.level}</span> <span className="c-muted">Used for {r.used_for}.</span>
        </li>
      ))}
    </ul>
  );
}

/** The previous and the next section, in reading order. */
export function PrevNext({ href }: { href: string }) {
  const { prev, next } = neighbours(href);
  return (
    <nav className="d-prevnext" aria-label="Previous and next section">
      {prev ? (
        <Link href={prev.href} className="d-prevnext__link">
          <span className="c-label">previous</span>
          <span>{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="d-prevnext__link d-prevnext__link--next">
          <span className="c-label">next</span>
          <span>{next.label}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
