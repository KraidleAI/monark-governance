// apps/site/components/marks/hikae-mark.tsx
// Hikae agent mark, transcribed faithfully from the MONARK brand-system source `hikae-mark.svg`
// (NOT committed to this repo; 2026-09-09). Ink = `currentColor` (the monitored series); accent
// hard-coded (#12857A, the two rails). Decorative (`aria-hidden`). External source path + sha256
// recorded privately; not part of this public mirror.
import type { SVGProps } from "react";

export function HikaeMark({ className, ...props }: SVGProps<SVGSVGElement>) {
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
        d="M11,22 L53,22 M11,42 L53,42"
        stroke="#12857A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M12,37 L20,26 L28,39 L36,25 L44,38 L52,29"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
