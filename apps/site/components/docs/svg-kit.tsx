// apps/site/components/docs/svg-kit.tsx: the drawing primitives of the documentation schemas. Server-safe (no hook, no
// state). One inline copy of each schema serves the light and the dark theme: every colour is a CSS variable of the site
// charter (app/globals.css), never a fixed value, so the `.dark` class on <html> re-themes the drawing with the page.
//
// HONESTY: the primitives carry geometry only. Visible words reach a drawing as JSX text children at the call site (the
// honesty lint scans them there) or as values read from the fleet register, the frozen schemas, the committed served data
// or the pure docs data modules (scanned for digits by test/site-docs.test.ts). A status is never typed: `StatusBox` and
// `StatusLegend` take the register's value and draw the style that goes with it.
import type { ReactNode } from "react";

/** The site charter's colours, as CSS variables (light and dark values live in app/globals.css). */
export const C = {
  ink: "var(--ink)",
  ink2: "var(--ink2)",
  surface: "var(--surface)",
  bg: "var(--bg)",
  rule: "var(--rule)",
  soft: "var(--rule-soft)",
  gate: "var(--hikae-t)",
  monark: "var(--monark-t)",
  sensor: "var(--shogen-t)",
  act: "var(--ukemi-t)",
  narabi: "var(--narabi)",
  bell: "var(--bell)",
  bellBg: "var(--bell-bg)",
  lav: "var(--cash-close)",
  lavBg: "var(--cash-close-bg)",
  commit: "var(--ok)",
  defer: "var(--defer)",
  abstain: "var(--abst)",
  deferBg: "var(--regime-holiday-bg)",
} as const;

const UI_FONT = "var(--font-sans)";
const MONO = "var(--font-mono)";

/** A register status, as the register spells it. Drawing styles are keyed on it; the word itself is never typed here. */
export type RegisterStatus = "built" | "upcoming";

/** The frame of every schema: a responsive SVG with its accessible name. `label` is the one sentence a screen reader
 *  hears; the caption under the figure (Figure) says the rest. `min` keeps the text legible on a narrow screen, where
 *  the figure scrolls sideways inside its figure box instead of shrinking; `min={0}` makes a drawing fluid (it never
 *  exceeds its container). */
export function Diagram({ w, h, label, min = 640, children }: { w: number; h: number; label: string; min?: number; children: ReactNode }) {
  return (
    <svg className="d-svg" viewBox={`0 0 ${String(w)} ${String(h)}`} role="img" aria-label={label} style={{ minWidth: min, maxWidth: "100%", width: "100%", height: "auto", display: "block" }} xmlns="http://www.w3.org/2000/svg">
      <title>{label}</title>
      {children}
    </svg>
  );
}

/** Text. Children are the visible words. */
export function Tx({
  x,
  y,
  size = 13,
  weight = 400,
  color = C.ink,
  anchor = "start",
  mono = false,
  italic = false,
  children,
}: {
  x: number;
  y: number;
  size?: number;
  weight?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
  italic?: boolean;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      textAnchor={anchor}
      fontFamily={mono ? MONO : UI_FONT}
      fontStyle={italic ? "italic" : undefined}
    >
      {children}
    </text>
  );
}

/** One more line inside a Tx, `dy` below the previous one, starting again at `x`. */
export function Ln({ x, dy = 16, children }: { x: number; dy?: number; children: ReactNode }) {
  return (
    <tspan x={x} dy={dy}>
      {children}
    </tspan>
  );
}

/** A plain box. `dashed` draws the outline of something named but not served; `accent` colours the outline. */
export function Box({
  x,
  y,
  w,
  h,
  rx = 10,
  fill = C.surface,
  stroke = C.rule,
  width = 1.4,
  dashed = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  fill?: string;
  stroke?: string;
  width?: number;
  dashed?: boolean;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={width} strokeDasharray={dashed ? "6 5" : undefined} />;
}

/** The drawing style of a register status: a built piece is a solid ink outline on the surface; an upcoming one is a
 *  dashed, muted outline with no fill. */
export function statusStyle(status: RegisterStatus): { fill: string; stroke: string; width: number; dashed: boolean; ink: string } {
  return status === "built"
    ? { fill: C.surface, stroke: C.ink, width: 1.8, dashed: false, ink: C.ink }
    : { fill: "none", stroke: C.ink2, width: 1.3, dashed: true, ink: C.ink2 };
}

/** A box drawn in the style of a register status. */
export function StatusBox({ x, y, w, h, status, rx = 10 }: { x: number; y: number; w: number; h: number; status: RegisterStatus; rx?: number }) {
  const s = statusStyle(status);
  return <Box x={x} y={y} w={w} h={h} rx={rx} fill={s.fill} stroke={s.stroke} width={s.width} dashed={s.dashed} />;
}

/** A labelled chip in the style of a register status: the name is read from the register by the caller. */
export function StatusChip({ x, y, w, h = 30, status, name, size = 13 }: { x: number; y: number; w: number; h?: number; status: RegisterStatus; name: string; size?: number }) {
  const s = statusStyle(status);
  return (
    <g>
      <StatusBox x={x} y={y} w={w} h={h} status={status} rx={8} />
      <Tx x={x + w / 2} y={y + h / 2 + size * 0.35} size={size} weight={600} color={s.ink} anchor="middle">
        {name}
      </Tx>
    </g>
  );
}

/** The legend of the register statuses present in a drawing: one swatch per status, the status word read from the
 *  register values passed in (never typed). */
export function StatusLegend({ x, y, statuses }: { x: number; y: number; statuses: readonly RegisterStatus[] }) {
  return (
    <g>
      {statuses.map((st, i) => (
        <g key={st}>
          <StatusBox x={x + i * 150} y={y - 12} w={34} h={18} status={st} rx={5} />
          <Tx x={x + i * 150 + 42} y={y + 1} size={12} color={C.ink2} mono>
            {st}
          </Tx>
        </g>
      ))}
    </g>
  );
}

/** An arrow along a polyline, with an explicit triangle head (no <marker>, no ids: safe to inline many drawings). */
export function Arrow({
  pts,
  color = C.ink2,
  width = 1.6,
  dashed = false,
  head = 8,
}: {
  pts: readonly (readonly [number, number])[];
  color?: string;
  width?: number;
  dashed?: boolean;
  head?: number;
}) {
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  if (last === undefined || prev === undefined) return null;
  const [x2, y2] = last;
  const [x1, y1] = prev;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - head * Math.cos(a);
  const by = y2 - head * Math.sin(a);
  const body = pts.slice(0, -1).map(([px, py]) => `${String(px)},${String(py)}`).join(" L");
  const hx = head * 0.55;
  const tri = `M${String(x2)},${String(y2)} L${String(bx - hx * Math.sin(a))},${String(by + hx * Math.cos(a))} L${String(bx + hx * Math.sin(a))},${String(by - hx * Math.cos(a))} Z`;
  return (
    <g>
      <path d={`M${body} L${String(bx)},${String(by)}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "5 4" : undefined} />
      <path d={tri} fill={color} />
    </g>
  );
}

/** A small filled dot (a node on a line). */
export function Dot({ cx, cy, r = 4, color = C.ink2 }: { cx: number; cy: number; r?: number; color?: string }) {
  return <circle cx={cx} cy={cy} r={r} fill={color} />;
}

/** A straight rule. */
export function Rule({ x1, y1, x2, y2, color = C.rule, width = 1, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; dashed?: boolean }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dashed ? "4 4" : undefined} />;
}

/** Greedy word wrap on a character budget (a drawing cannot reflow): the lines of `text`, each at most `max` characters
 *  when a word allows it. Used for words read from data; words typed at a call site are laid out by hand with Ln. */
export function wrapWords(text: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/).filter((w) => w.length > 0)) {
    const next = cur.length === 0 ? word : `${cur} ${word}`;
    if (next.length > max && cur.length > 0) {
      out.push(cur);
      cur = word;
    } else {
      cur = next;
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

/** A block of wrapped text read from data (a register value, a served clause, a docs data string). */
export function TxBlock({
  x,
  y,
  text,
  max,
  size = 12.5,
  lh = 16,
  color = C.ink,
  weight = 400,
  mono = false,
}: {
  x: number;
  y: number;
  text: string;
  max: number;
  size?: number;
  lh?: number;
  color?: string;
  weight?: number;
  mono?: boolean;
}) {
  const lines = wrapWords(text, max);
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={color} fontFamily={mono ? MONO : UI_FONT}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

/** How many lines TxBlock will draw for this text (to stack blocks without overlap). */
export function lineCount(text: string, max: number): number {
  return wrapWords(text, max).length;
}
