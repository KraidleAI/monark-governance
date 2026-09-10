// apps/site/components/marks/genkan-mark.tsx
// Genkan agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('genkan') branch of MONARK.dc.html (line 619; external, not committed to this public mirror;
// sha256 + exact line recorded in the MONARK governance doc docs/G1-lot-fsite-2.md, not part of this public mirror). Ink = currentColor (the arch + inward arrow);
// accent hard-coded (#B06A4A, the threshold bar). Decorative (aria-hidden), so the adjacent text label is
// the accessible name.
import type { SVGProps } from "react";

export function GenkanMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M18,49 L18,26 Q18,13 32,13 Q46,13 46,26 L46,49" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14,49 L50,49" stroke="#B06A4A" strokeWidth="4.6" strokeLinecap="round" />
      <path d="M32,45 L32,33 M27,38 L32,33 L37,38" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
