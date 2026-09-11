// apps/site/components/marks/kyokusen-mark.tsx
// Kyokusen agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('kyokusen') branch of MONARK.dc.html (line 617; external, not committed to this public mirror;
// sha256 + exact line recorded privately; not part of this public mirror). Ink = currentColor (the axes); accent
// hard-coded (#C0478F, the curve and its point). Decorative (aria-hidden), so the adjacent text label is
// the accessible name.
import type { SVGProps } from "react";

export function KyokusenMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M15,49 L15,15 M15,49 L51,49" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M17,45 Q26,20 51,17" fill="none" stroke="#C0478F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="26" r="3.4" fill="#C0478F" />
    </svg>
  );
}
