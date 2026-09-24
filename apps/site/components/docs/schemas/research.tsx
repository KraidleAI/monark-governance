// apps/site/components/docs/schemas/research.tsx: the map of the research behind the engine. Five questions, each with the
// method MONARK applies and the piece or the application that carries the answer (the names and their register statuses are
// read from the fleet register by the page and passed in). The words of the questions and methods are the page's own.
import { Diagram, Tx, Box, Arrow, TxBlock, statusStyle, C, type RegisterStatus } from "../svg-kit";

export interface ResearchNode {
  question: string;
  method: string;
  carrier: string;
  status: RegisterStatus;
}

/** Five questions around one rule: measure first, publish what was measured, abstain where nothing is. */
export function ResearchMapSchema({ nodes }: { nodes: readonly ResearchNode[] }) {
  const pos: readonly (readonly [number, number])[] = [
    [20, 30],
    [680, 30],
    [20, 330],
    [680, 330],
    [350, 400],
  ];
  const w = 280;
  const h = 150;
  return (
    <Diagram w={980} h={580} label="Five research questions, each with its method and the piece that carries the answer, around one rule: measure first.">
      <rect x={350} y={200} width={280} height={130} rx={65} fill={C.ink} />
      <Tx x={490} y={250} size={17} weight={800} color={C.bg} anchor="middle">
        Measure first
      </Tx>
      <Tx x={490} y={274} size={12} color={C.bg} anchor="middle">
        publish what was measured,
      </Tx>
      <Tx x={490} y={292} size={12} color={C.bg} anchor="middle">
        abstain where nothing is
      </Tx>
      {nodes.map((n, i) => {
        const p = pos[i];
        if (p === undefined) return null;
        const [x, y] = p;
        const s = statusStyle(n.status);
        const cx = x + w / 2;
        const cy = y + h / 2;
        return (
          <g key={n.question}>
            <Arrow pts={[[cx, cy], [cx + (490 - cx) * 0.62, cy + (265 - cy) * 0.62]]} color={C.rule} width={1.4} head={0} />
            <Box x={x} y={y} w={w} h={h} rx={14} fill={C.surface} stroke={C.ink} width={1.6} />
            <TxBlock x={x + 16} y={y + 28} text={n.question} max={30} size={14} lh={18} weight={800} color={C.ink} />
            <TxBlock x={x + 16} y={y + 72} text={n.method} max={40} size={12} lh={15} color={C.ink2} />
            <rect x={x + 16} y={y + h - 36} width={w - 32} height={24} rx={8} fill={s.fill} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dashed ? "6 5" : undefined} />
            <Tx x={x + 28} y={y + h - 19} size={12} weight={700} color={s.ink}>
              {n.carrier}
            </Tx>
            <Tx x={x + w - 28} y={y + h - 19} size={10.5} color={C.ink2} anchor="end" mono>
              {n.status}
            </Tx>
          </g>
        );
      })}
    </Diagram>
  );
}
