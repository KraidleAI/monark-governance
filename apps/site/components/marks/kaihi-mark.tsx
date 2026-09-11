// apps/site/components/marks/kaihi-mark.tsx
// Kaihi agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('kaihi') branch of MONARK.dc.html (line 614; external, not committed to this public mirror;
// sha256 + exact line recorded privately; not part of this public mirror). Ink = currentColor (the diamond); accent
// hard-coded (#E06B2E, the avoidance arc and its arrowhead). Decorative (aria-hidden), so the adjacent
// text label is the accessible name.
import type { SVGProps } from "react";

export function KaihiMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M32,36 L37,42 L32,48 L27,42 Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M10,44 C18,44 20,22 32,22 C44,22 46,44 54,44" fill="none" stroke="#E06B2E" strokeWidth="3" strokeLinecap="round" />
      <path d="M50,41 L54,44 L50,47" fill="none" stroke="#E06B2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
