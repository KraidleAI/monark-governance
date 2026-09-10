// apps/site/components/marks/narabi-mark.tsx
// Narabi agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('narabi') branch of MONARK.dc.html (line 613; external, not committed to this public mirror;
// sha256 + exact line recorded in the MONARK governance doc docs/G1-lot-fsite-2.md, not part of this public mirror). Ink = currentColor (the queue bars +
// baseline); accent hard-coded (#B8922E, the standing bar and its cap). Decorative (aria-hidden), so the
// adjacent text label is the accessible name.
import type { SVGProps } from "react";

export function NarabiMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M11,49 L53,49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M15,47 L15,41" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24,47 L24,37" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M33,47 L33,32" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M42,47 L42,26" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M51,47 L51,18" stroke="#B8922E" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M47,20 L51,15 L55,20" stroke="#B8922E" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
