// apps/site/components/marks/kamae-mark.tsx
// Kamae agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('kamae') branch of MONARK.dc.html (line 616; external, not committed to this public mirror;
// sha256 + exact line recorded in the MONARK governance doc docs/G1-lot-fsite-2.md, not part of this public mirror). Ink = currentColor (the four legs); accent
// hard-coded (#7A5AC2, the stance node). Decorative (aria-hidden), so the adjacent text label is the
// accessible name.
import type { SVGProps } from "react";

export function KamaeMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M32,29 L17,19 M32,29 L47,19 M32,29 L23,48 M32,29 L41,48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="29" r="5" fill="#7A5AC2" />
    </svg>
  );
}
