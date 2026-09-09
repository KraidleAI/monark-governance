// apps/site/components/marks/ukemi-mark.tsx
// Ukemi agent mark, transcribed faithfully from the MONARK brand-system source `ukemi-mark.svg`
// (NOT committed to this repo; 2026-09-09). Ink = `currentColor` (falling bars + baseline); accent
// hard-coded (#5661C9, the standing bar). Decorative (`aria-hidden`). External source path + sha256
// recorded in the MONARK governance repository (docs/G1-lot-F2b.md, not part of this public mirror).
import type { SVGProps } from "react";

export function UkemiMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M10,48 L54,48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M14,46 L15,28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M24,46 L28,29" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M34,46 L42,32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M49,47 L49,19" stroke="#5661C9" strokeWidth="4.6" strokeLinecap="round" />
    </svg>
  );
}
