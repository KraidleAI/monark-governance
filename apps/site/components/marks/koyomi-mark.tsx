// apps/site/components/marks/koyomi-mark.tsx
// Koyomi agent mark, transcribed faithfully (2026-09-10) from the MONARK brand-system design source —
// the mark('koyomi') branch of MONARK.dc.html (line 618; external, not committed to this public mirror;
// sha256 + exact line recorded in the MONARK governance doc docs/G1-lot-fsite-2.md, not part of this public mirror). Ink = currentColor (the header + weekday
// cells); accent hard-coded (#1E9AA6, the two outlined weekend cells). Decorative (aria-hidden), so the
// adjacent text label is the accessible name.
import type { SVGProps } from "react";

export function KoyomiMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="11" y="15" width="47" height="5" rx="1.5" fill="currentColor" />
      <rect x="11" y="26" width="5" height="11" rx="1.5" fill="currentColor" />
      <rect x="20" y="26" width="5" height="11" rx="1.5" fill="currentColor" />
      <rect x="29" y="26" width="5" height="11" rx="1.5" fill="currentColor" />
      <rect x="38" y="26" width="5" height="11" rx="1.5" fill="currentColor" />
      <rect x="47.5" y="26" width="5" height="11" rx="1.5" fill="none" stroke="#1E9AA6" strokeWidth="2" />
      <rect x="47.5" y="41" width="5" height="7" rx="1.5" fill="none" stroke="#1E9AA6" strokeWidth="2" />
      <rect x="11" y="41" width="14" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="29" y="41" width="14" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
