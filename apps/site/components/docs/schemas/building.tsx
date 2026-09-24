// apps/site/components/docs/schemas/building.tsx: the trajectory of MONARK Building, in three columns: what is under way now
// (each item derived by the page from the register or the served data), what is in preparation next (intentions, with the date
// they were written down, never a promised date) and the direction beyond. The words are handed in by the page. The drawing
// is fluid (no minimum width): it scales to its container at any width, and the same items are listed as text below it.
import { Diagram, Tx, Box, Arrow, TxBlock, lineCount, C } from "../svg-kit";

export interface TrajectoryColumn {
  head: string;
  sub: string;
  items: readonly string[];
}

/** Now, next, longer term: three columns joined by arrows, each item a wrapped line of the page's own words. */
export function TrajectorySchema({ columns }: { columns: readonly TrajectoryColumn[] }) {
  const w = 290;
  const gap = 35;
  const max = Math.floor((w - 52) / 6.5);
  const heights = columns.map((c) => 70 + c.items.reduce((acc, it) => acc + lineCount(it, max) * 16 + 12, 0) + 10);
  const h = Math.max(...heights) + 60;
  const tones = [C.commit, C.defer, C.ink2];
  return (
    <Diagram w={980} h={h} min={0} label="The trajectory of MONARK Building: what is under way now, what is in preparation next, and the direction beyond.">
      {columns.map((c, i) => {
        const x = 20 + i * (w + gap);
        let cy = 92;
        return (
          <g key={c.head}>
            <Box x={x} y={20} w={w} h={h - 60} rx={14} fill={i === 0 ? C.surface : "none"} stroke={tones[i] ?? C.ink2} width={1.8} dashed={i > 0} />
            <Tx x={x + 18} y={50} size={16} weight={800} color={C.ink}>
              {c.head}
            </Tx>
            <Tx x={x + 18} y={70} size={11} color={C.ink2} mono>
              {c.sub}
            </Tx>
            {c.items.map((it) => {
              const at = cy;
              cy += lineCount(it, max) * 16 + 12;
              return (
                <g key={it}>
                  <circle cx={x + 24} cy={at - 4} r={3.5} fill={tones[i] ?? C.ink2} />
                  <TxBlock x={x + 34} y={at} text={it} max={max} size={12.5} lh={16} color={C.ink} />
                </g>
              );
            })}
            {i < columns.length - 1 ? <Arrow pts={[[x + w + 3, 44], [x + w + gap - 3, 44]]} color={C.ink} width={2} /> : null}
          </g>
        );
      })}
      <Tx x={20} y={h - 16} size={12} color={C.ink2} italic>
        Solid: under way today, read from the register and the served files. Dashed: intentions and direction, with no promised date.
      </Tx>
    </Diagram>
  );
}
