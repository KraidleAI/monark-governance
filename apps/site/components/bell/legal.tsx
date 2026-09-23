import type { ReactNode } from "react";
import { sectionNumber } from "@/lib/bell-legal";

// Numbered section and section reference of the Bell legal pages (lot SITE-LEGAL-1). The number is never typed: it is
// the section's position in its page's ordered id list (lib/bell-legal.ts), for the heading and for every reference,
// so "§8" in a sentence and the "8." of its heading cannot disagree. The heading text is the validated title.

export function LegalSection<T extends string>({
  order,
  id,
  title,
  children,
}: {
  order: readonly T[];
  id: T;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="c-legal-section" id={id} aria-labelledby={`h-${id}`}>
      <h2 className="c-h2" id={`h-${id}`}>
        {sectionNumber(order, id)}. {title}
      </h2>
      {children}
    </section>
  );
}

/** "§n" linking to section `id` — on this page by default, or on another page when `page` is given. */
export function SectionRef<T extends string>({ order, id, page }: { order: readonly T[]; id: T; page?: string }) {
  return <a href={`${page ?? ""}#${id}`}>§{sectionNumber(order, id)}</a>;
}
