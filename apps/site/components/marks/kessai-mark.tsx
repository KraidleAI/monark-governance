// apps/site/components/marks/kessai-mark.tsx
// Kessai agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('kessai') branch of MONARK.dc.html (line 615; external, not committed to this public mirror;
// sha256 + exact line recorded in the MONARK governance doc docs/G1-lot-fsite-2.md, not part of this public mirror). Ink = currentColor (the two settlement
// arrows); accent hard-coded (#2E8B57, the settlement node). Decorative (aria-hidden), so the adjacent
// text label is the accessible name.
import type { SVGProps } from "react";

export function KessaiMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12,23 L40,23 M38,20 L42,23 L38,26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52,41 L24,41 M26,38 L22,41 L26,44" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="6" fill="#2E8B57" />
    </svg>
  );
}
