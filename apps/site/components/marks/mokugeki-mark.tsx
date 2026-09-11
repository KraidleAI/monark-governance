// apps/site/components/marks/mokugeki-mark.tsx
// Mokugeki agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('mokugeki') branch of MONARK.dc.html (line 612; external, not committed to this public mirror;
// sha256 + exact line recorded privately; not part of this public mirror). Ink = currentColor; accent hard-coded
// (#4E6E8E, the two brackets). Decorative (aria-hidden), so the adjacent text label is the accessible name.
import type { SVGProps } from "react";

export function MokugekiMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M23,16 L14,16 L14,48 L23,48" stroke="#4E6E8E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M41,16 L50,16 L50,48 L41,48" stroke="#4E6E8E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32,24 L32,40 M24,32 L40,32 M26.5,26.5 L37.5,37.5 M37.5,26.5 L26.5,37.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  );
}
