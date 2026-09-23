// apps/site/components/lockups.tsx — the four MONARK lock-ups of charter C, lettering in PATHS (ruling Q1,
// decision 146; geometry of the three "proposed" forms accepted by the orchestrator ruling of 2026-09-23).
// Transcribed from the designer's local files (snapshot of 2026-09-23 13:18 UTC; sha256 recorded in the lot
// report): lockups/monark-lockup-horizontal-light.svg (MONARK, header), lockups/monark-bell-lockup-stacked-light.svg
// (Bell, handoff geometry), and the Narabi / Ukemi final lock-ups inlined in narabi.html / ukemi.html (decision 120).
// ONE svg per lock-up: the ink is `currentColor` and the accent is the product token (var(--narabi) / var(--ukemi)
// / var(--bell)), so the light and dark variants of the designer's files (identical up to those two colours,
// measured) are reproduced by the theme tokens instead of two inlined copies. The M3 point keeps #A6453E in both
// themes (brand freeze 2026-09-07). Decorative: aria-hidden; the enclosing link carries the accessible name.
import type { CSSProperties, SVGProps } from "react";

const acc = (token: string): CSSProperties => ({ fill: token });

// The MONARK word as set in the horizontal lock-up (Archivo Black 70 / -3, outlined).
const MONARK_H_WORD =
  "M147.4 112V94.64Q147.4 91.42 147.64 88.03Q147.89 84.63 148.17 82.32Q148.45 80.01 148.52 79.38H148.24L139.35 112H127.24L118.28 79.45H118Q118.07 80.08 118.38 82.35Q118.7 84.63 118.98 88.03Q119.26 91.42 119.26 94.64V112H105.05V63.84H126.89L134.17 91.63H134.45L141.66 63.84H162.73V112Z M219.09 87.92Q219.09 100.1 212.3 106.47Q205.51 112.84 193.05 112.84Q180.59 112.84 173.83 106.5Q167.08 100.17 167.08 87.92Q167.08 75.67 173.83 69.33Q180.59 63 193.05 63Q205.51 63 212.3 69.37Q219.09 75.74 219.09 87.92ZM182.9 85.68V90.16Q182.9 95.27 185.49 98.28Q188.08 101.29 193.05 101.29Q198.02 101.29 200.64 98.28Q203.27 95.27 203.27 90.16V85.68Q203.27 80.57 200.64 77.56Q198.02 74.55 193.05 74.55Q188.08 74.55 185.49 77.56Q182.9 80.57 182.9 85.68Z M258.86 112 238.62 88.62V112H224.42V63.84H237.93L258.16 87.57V63.84H272.37V112Z M311.3 112 309.27 105.21H292.4L290.37 112H274.55L292.12 63.84H310.11L327.68 112ZM295.62 94.43H306.05L301.01 77.28H300.73Z M366.89 91.84 377.6 112H360.24L351.7 94.43H345.96V112H330.49V63.84H359.96Q365.14 63.84 368.81 65.83Q372.49 67.83 374.34 71.22Q376.2 74.62 376.2 78.61Q376.2 83.02 373.82 86.59Q371.44 90.16 366.89 91.84ZM356.11 74.83H345.96V83.72H356.11Q357.93 83.72 359.19 82.42Q360.45 81.13 360.45 79.24Q360.45 77.35 359.19 76.09Q357.93 74.83 356.11 74.83Z M414.57 63.84H433.75L416.46 83.65L434.1 112H415.83L405.82 94.36L397.42 101.22V112H381.95V63.84H397.42V84.42Z";

// The MONARK word shared by the stacked Narabi / Ukemi lock-ups (Bell x 0.8, decision 120).
const MONARK_PRODUCT_WORD =
  "M169.24 92V78.11Q169.24 75.54 169.44 72.82Q169.63 70.1 169.86 68.26Q170.08 66.41 170.14 65.9H169.91L162.8 92H153.11L145.94 65.96H145.72Q145.78 66.46 146.03 68.28Q146.28 70.1 146.5 72.82Q146.73 75.54 146.73 78.11V92H135.36V53.47H152.83L158.66 75.7H158.88L164.65 53.47H181.5V92Z M226.59 72.74Q226.59 82.48 221.16 87.58Q215.73 92.67 205.76 92.67Q195.79 92.67 190.39 87.6Q184.98 82.54 184.98 72.74Q184.98 62.94 190.39 57.87Q195.79 52.8 205.76 52.8Q215.73 52.8 221.16 57.9Q226.59 62.99 226.59 72.74ZM197.64 70.94V74.53Q197.64 78.62 199.71 81.02Q201.78 83.43 205.76 83.43Q209.74 83.43 211.84 81.02Q213.94 78.62 213.94 74.53V70.94Q213.94 66.86 211.84 64.45Q209.74 62.04 205.76 62.04Q201.78 62.04 199.71 64.45Q197.64 66.86 197.64 70.94Z M258.41 92 242.22 73.3V92H230.86V53.47H241.66L257.85 72.46V53.47H269.22V92Z M300.36 92 298.74 86.57H285.24L283.62 92H270.96L285.02 53.47H299.41L313.46 92ZM287.82 77.94H296.16L292.13 64.22H291.9Z M344.83 75.87 353.4 92H339.51L332.68 77.94H328.09V92H315.71V53.47H339.29Q343.43 53.47 346.37 55.07Q349.31 56.66 350.8 59.38Q352.28 62.1 352.28 65.29Q352.28 68.82 350.38 71.67Q348.47 74.53 344.83 75.87ZM336.21 62.26H328.09V69.38H336.21Q337.66 69.38 338.67 68.34Q339.68 67.3 339.68 65.79Q339.68 64.28 338.67 63.27Q337.66 62.26 336.21 62.26Z M382.98 53.47H398.32L384.49 69.32L398.6 92H383.98L375.98 77.89L369.26 83.38V92H356.88V53.47H369.26V69.94Z";

const NARABI_WORD =
  "M135.36 137V118.8H141.89L145.5 134.66H145.97V118.8H149.35V137H142.82L139.21 121.14H138.74V137Z M186.68 137 191.46 118.8H197.44L202.22 137H198.69L197.7 133H191.2L190.21 137ZM192.01 129.82H196.89L194.68 120.96H194.22Z M239.55 137V118.8H247.46Q249.17 118.8 250.45 119.4Q251.72 120 252.42 121.09Q253.13 122.18 253.13 123.66V123.97Q253.13 125.61 252.35 126.63Q251.57 127.64 250.42 128.11V128.58Q251.46 128.63 252.03 129.29Q252.61 129.95 252.61 131.05V137H249.17V131.54Q249.17 130.92 248.85 130.53Q248.52 130.14 247.77 130.14H242.99V137ZM242.99 127.02H247.09Q248.32 127.02 249 126.35Q249.69 125.69 249.69 124.6V124.34Q249.69 123.25 249.02 122.58Q248.34 121.92 247.09 121.92H242.99Z M289.88 137 294.67 118.8H300.65L305.43 137H301.89L300.91 133H294.41L293.42 137ZM295.21 129.82H300.1L297.89 120.96H297.42Z M342.24 137V133.98H344.63V121.82H342.24V118.8H351.6Q353.26 118.8 354.5 119.36Q355.73 119.92 356.42 120.95Q357.11 121.97 357.11 123.4V123.66Q357.11 124.91 356.64 125.7Q356.18 126.5 355.54 126.92Q354.9 127.35 354.33 127.54V128Q354.9 128.16 355.58 128.59Q356.25 129.02 356.73 129.82Q357.22 130.63 357.22 131.93V132.19Q357.22 133.7 356.51 134.78Q355.81 135.86 354.58 136.43Q353.34 137 351.7 137ZM348.06 133.88H351.29Q352.41 133.88 353.09 133.33Q353.78 132.79 353.78 131.77V131.51Q353.78 130.5 353.11 129.95Q352.43 129.41 351.29 129.41H348.06ZM348.06 126.29H351.24Q352.3 126.29 352.99 125.74Q353.68 125.2 353.68 124.23V123.97Q353.68 122.99 353 122.45Q352.33 121.92 351.24 121.92H348.06Z M395.17 137V118.8H398.6V137Z";

const UKEMI_WORD =
  "M142.48 137.36Q140.25 137.36 138.65 136.55Q137.05 135.73 136.21 134.2Q135.36 132.68 135.36 130.6V118.8H138.79V130.71Q138.79 132.37 139.74 133.33Q140.69 134.3 142.48 134.3Q144.28 134.3 145.23 133.33Q146.18 132.37 146.18 130.71V118.8H149.61V130.6Q149.61 132.68 148.76 134.2Q147.92 135.73 146.32 136.55Q144.72 137.36 142.48 137.36Z M200.09 137V118.8H203.52V126.03H203.99L209.89 118.8H214.29L206.69 127.77L214.55 137H210.02L203.99 129.62H203.52V137Z M263.52 137V118.8H275.22V121.92H266.95V126.26H274.49V129.38H266.95V133.88H275.38V137Z M325.08 137V118.8H331.45L334.6 134.66H335.06L338.21 118.8H344.58V137H341.25V121.32H340.79L337.67 137H332L328.88 121.32H328.41V137Z M395.17 137V118.8H398.6V137Z";

const BELL_M =
  "M46.55 112V94.64Q46.55 91.42 46.8 88.03Q47.04 84.63 47.32 82.32Q47.6 80.01 47.67 79.38H47.39L38.5 112H26.39L17.43 79.45H17.15Q17.22 80.08 17.54 82.35Q17.85 84.63 18.13 88.03Q18.41 91.42 18.41 94.64V112H4.2V63.84H26.04L33.32 91.63H33.6L40.81 63.84H61.88V112Z";

const BELL_NARK =
  "M195.62 112 175.39 88.62V112H161.18V63.84H174.69L194.92 87.57V63.84H209.13V112Z M248.06 112 246.03 105.21H229.16L227.13 112H211.31L228.88 63.84H246.87L264.44 112ZM232.38 94.43H242.81L237.77 77.28H237.49Z M303.65 91.84 314.36 112H297L288.46 94.43H282.72V112H267.25V63.84H296.72Q301.9 63.84 305.58 65.83Q309.25 67.83 311.11 71.22Q312.96 74.62 312.96 78.61Q312.96 83.02 310.58 86.59Q308.2 90.16 303.65 91.84ZM292.87 74.83H282.72V83.72H292.87Q294.69 83.72 295.95 82.42Q297.21 81.13 297.21 79.24Q297.21 77.35 295.95 76.09Q294.69 74.83 292.87 74.83Z M351.33 63.84H370.51L353.22 83.65L370.86 112H352.59L342.58 94.36L334.18 101.22V112H318.71V63.84H334.18V84.42Z";

const BELL_WORD =
  "M289.34 158V154.98H291.74V142.82H289.34V139.8H298.7Q300.37 139.8 301.6 140.36Q302.84 140.92 303.53 141.94Q304.22 142.97 304.22 144.4V144.66Q304.22 145.91 303.75 146.7Q303.28 147.5 302.64 147.93Q302.01 148.35 301.43 148.54V149Q302.01 149.16 302.68 149.59Q303.36 150.02 303.84 150.82Q304.32 151.63 304.32 152.93V153.19Q304.32 154.7 303.62 155.78Q302.92 156.86 301.68 157.43Q300.45 158 298.81 158ZM295.17 154.88H298.39Q299.51 154.88 300.2 154.33Q300.89 153.79 300.89 152.77V152.51Q300.89 151.5 300.21 150.95Q299.54 150.41 298.39 150.41H295.17ZM295.17 147.29H298.34Q299.41 147.29 300.1 146.74Q300.78 146.2 300.78 145.23V144.97Q300.78 143.99 300.11 143.45Q299.43 142.92 298.34 142.92H295.17Z M315.13 158V139.8H326.83V142.92H318.56V147.26H326.1V150.38H318.56V154.88H326.98V158Z M337.53 158V139.8H340.96V154.88H349.28V158Z M359.62 158V139.8H363.06V154.88H371.38V158Z";

type LockupProps = SVGProps<SVGSVGElement>;

/** MONARK horizontal lock-up (M3 mark + MONARK word), header use (ruling: 32 px, 24 px under 720 px). */
export function MonarkLockup(props: LockupProps) {
  return (
    <svg viewBox="8.54 61.84 427.56 52.16" aria-hidden="true" focusable="false" {...props}>
      <g transform="translate(0.0,39.76) scale(1.51)" fill="none">
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
      </g>
      <path fill="currentColor" d={MONARK_H_WORD} />
    </svg>
  );
}

/** MONARK Narabi stacked lock-up (concept A, decision 104/120). */
export function NarabiLockup(props: LockupProps) {
  return (
    <svg viewBox="0 24 412 120" aria-hidden="true" focusable="false" {...props}>
      <g transform="translate(-16.2,-2.2) scale(2.2)" fill="none" strokeLinecap="round">
        <path d="M11,49 L53,49" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        <path d="M15,47 L15,41" stroke="currentColor" strokeWidth="3.2" />
        <path d="M24,47 L24,37" stroke="currentColor" strokeWidth="3.2" />
        <path d="M33,47 L33,32" stroke="currentColor" strokeWidth="3.2" />
        <path d="M42,47 L42,26" stroke="currentColor" strokeWidth="3.2" />
        <path d="M51,47 L51,18" style={{ stroke: "var(--narabi)" }} strokeWidth="3.6" />
        <path d="M47,20 L51,15 L55,20" style={{ stroke: "var(--narabi)" }} strokeWidth="2.6" strokeLinejoin="round" />
      </g>
      <circle cx="96" cy="124" r="7" style={acc("var(--narabi)")} />
      <path fill="currentColor" d={MONARK_PRODUCT_WORD} />
      <rect x="133.6" y="104" width="272.31" height="3" fill="currentColor" />
      <path fill="currentColor" d={NARABI_WORD} />
    </svg>
  );
}

/** MONARK Ukemi stacked lock-up (concept 03, decision 103/120). */
export function UkemiLockup(props: LockupProps) {
  return (
    <svg viewBox="0 24 412 120" aria-hidden="true" focusable="false" {...props}>
      <g transform="translate(-14,0) scale(2.2)" fill="none" strokeLinecap="round">
        <path d="M10,48 L54,48" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        <path d="M14,46 L15,28" stroke="currentColor" strokeWidth="3" />
        <path d="M24,46 L28,29" stroke="currentColor" strokeWidth="3" />
        <path d="M34,46 L42,32" stroke="currentColor" strokeWidth="3" />
        <path d="M49,47 L49,19" style={{ stroke: "var(--ukemi)" }} strokeWidth="4.6" />
      </g>
      <circle cx="93.8" cy="124" r="7" style={acc("var(--ukemi)")} />
      <path fill="currentColor" d={MONARK_PRODUCT_WORD} />
      <rect x="133.6" y="104" width="272.31" height="3" fill="currentColor" />
      <path fill="currentColor" d={UKEMI_WORD} />
    </svg>
  );
}

/** MONARK Bell stacked lock-up (concept 01 "Bauhaus", decision 64; the bell replaces the O). Framed with the
 *  mock pages' viewBox (bell.html / index.html: 0 40 400 130), so it sits at the same visual size as there; the
 *  designer's final file frames the same paths tightly (0 61.84 382 98.16). */
export function BellLockup(props: LockupProps) {
  return (
    <svg viewBox="0 40 400 130" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d={BELL_M} />
      <g transform="translate(84,52)">
        <path d="M0 50 A28 28 0 0 1 56 50 Z" fill="currentColor" />
        <rect x="-4" y="50" width="64" height="7" fill="currentColor" />
        <circle cx="28" cy="68" r="7" style={acc("var(--bell)")} />
      </g>
      <path fill="currentColor" d={BELL_NARK} />
      <rect x="2" y="126" width="378" height="3" fill="currentColor" />
      <path fill="currentColor" d={BELL_WORD} />
    </svg>
  );
}

/** MONARK Bell mark (dome, lip, mint clapper) — 64 x 64, ink = currentColor. */
export function BellMark(props: LockupProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...props}>
      <path d="M8 40 A24 24 0 0 1 56 40 Z" fill="currentColor" />
      <rect x="4" y="40" width="56" height="6" fill="currentColor" />
      <circle cx="32" cy="55" r="6" style={acc("var(--bell)")} />
    </svg>
  );
}
