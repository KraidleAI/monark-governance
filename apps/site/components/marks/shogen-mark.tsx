// apps/site/components/marks/shogen-mark.tsx
// Shogen agent mark, transcribed faithfully from the MONARK brand-system source `shogen-mark.svg`
// (NOT committed to this repo; 2026-09-09). Ink = `currentColor`; accent hard-coded (#FF6B4A).
// Decorative (`aria-hidden`). External source path + sha256 recorded privately; not part of this public mirror (own-the-code).
import type { SVGProps } from "react";

export function ShogenMark({ className, ...props }: SVGProps<SVGSVGElement>) {
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
        d="M14 18 L32 48 M32 12 L32 48 M50 18 L32 48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="14" cy="16" r="6" fill="currentColor" />
      <circle cx="32" cy="10" r="6" fill="currentColor" />
      <circle cx="50" cy="16" r="6" fill="currentColor" />
      <circle cx="32" cy="50" r="8" fill="#FF6B4A" />
    </svg>
  );
}
