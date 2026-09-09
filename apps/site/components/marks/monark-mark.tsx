// apps/site/components/marks/monark-mark.tsx
// MONARK brand mark, transcribed faithfully from the MONARK brand-system source `monark-mark.svg`
// (NOT committed to this repo; 2026-09-09). Ink = `currentColor` (follows the text colour of the
// caller via className); accent hard-coded (#A6453E). Decorative: `aria-hidden`, so the adjacent text
// label is the accessible name. External source path + sha256 recorded in the MONARK governance repository (docs/G1-lot-F2b.md, not part of this public mirror; own-the-code, R-8).
import type { SVGProps } from "react";

export function MonarkMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M11,20 L32,32 M11,32 L32,32 M11,44 L32,32 M32,32 L53,20 M32,32 L53,32 M32,32 L53,44"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="11" cy="20" r="4" fill="currentColor" />
      <circle cx="11" cy="32" r="4" fill="currentColor" />
      <circle cx="11" cy="44" r="4" fill="currentColor" />
      <circle cx="53" cy="20" r="4" fill="currentColor" />
      <circle cx="53" cy="32" r="4" fill="currentColor" />
      <circle cx="53" cy="44" r="4" fill="currentColor" />
      <circle cx="32" cy="32" r="7.5" fill="#A6453E" />
    </svg>
  );
}
