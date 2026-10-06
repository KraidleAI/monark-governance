// apps/site/components/docs/schemas/pieces.tsx: the map of the engine's pieces by role, and the plate of one piece
// (entry, mechanism, output). Adapted from the pitch deck's fleet-by-maturity plate and piece plates, redrawn in the site's
// charter. Names, roles and statuses are read from the fleet register; the words of a plate come from lib/docs-pieces.ts
// (scanned digit-free by the root test); contract titles come from schemas/. A status is drawn as a style, never typed.
import { FLEET_AGENTS, type FleetAgent } from "@/lib/fleet";
import type { PieceDoc, PieceZone } from "@/lib/docs-pieces";
import { Diagram, Tx, StatusBox, StatusChip, StatusLegend, statusStyle, Arrow, TxBlock, lineCount, C, type RegisterStatus } from "../svg-kit";

const ROLE_ORDER: readonly FleetAgent["role"][] = ["sensor", "gate", "act", "distribution"];
const ROLE_HEAD: Readonly<Record<FleetAgent["role"], string>> = {
  sensor: "SENSORS · attest",
  gate: "THE GATE · decides",
  act: "ACTS · execute on commit",
  distribution: "THE DOOR · lets agents in",
};

/** The engine's pieces in four columns by role, each chip in the style of its register status, with the flow between
 *  roles: a sensor's testimony feeds the gate, the gate's decision frees an act, the door leads to the gate. */
export function FleetMapSchema() {
  const cols = ROLE_ORDER.map((role) => ({ role, agents: FLEET_AGENTS.filter((a) => a.role === role) }));
  const statuses: RegisterStatus[] = [...new Set(FLEET_AGENTS.map((a) => a.status))].sort();
  const colX = [20, 260, 500, 740];
  const rowsMax = Math.max(...cols.map((c) => c.agents.length));
  const h = 150 + rowsMax * 44;
  return (
    <Diagram w={980} h={h} label="The pieces of the engine by role, each drawn in the style of its register status.">
      {cols.map((c, i) => {
        const x = colX[i] ?? 20;
        return (
          <g key={c.role}>
            <rect x={x} y={20} width={220} height={h - 70} rx={12} fill={C.soft} stroke={C.rule} />
            <Tx x={x + 14} y={46} size={12} weight={700} color={C.ink} mono>
              {ROLE_HEAD[c.role]}
            </Tx>
            {c.agents.map((a, j) => (
              <StatusChip key={a.name} x={x + 14} y={64 + j * 44} w={192} h={32} status={a.status} name={a.name} size={13} />
            ))}
          </g>
        );
      })}
      <Arrow pts={[[240, 90], [258, 90]]} color={C.ink} width={2} />
      <Arrow pts={[[480, 90], [498, 90]]} color={C.ink} width={2} />
      <Arrow pts={[[760, h - 34], [370, h - 34], [370, h - 52]]} color={C.ink2} width={1.6} dashed />
      <Tx x={560} y={h - 40} size={11} color={C.ink2} anchor="middle">
        other agents reach the gate through the door
      </Tx>
      <StatusLegend x={24} y={h - 14} statuses={statuses} />
    </Diagram>
  );
}

/** The height a zone needs for its title and lines at width w (the same wrap rules as Zone). */
function zoneHeight(zone: PieceZone, w: number): number {
  const titleMax = Math.floor((w - 28) / 8);
  const lineMax = Math.floor((w - 28) / 6.6);
  return 62 + lineCount(zone.title, titleMax) * 18 + zone.lines.reduce((acc, l) => acc + lineCount(l, lineMax) * 16 + 6, 0) + 10;
}

function Zone({ x, y, w, h, head, zone, status }: { x: number; y: number; w: number; h: number; head: string; zone: PieceZone; status: RegisterStatus }) {
  const s = statusStyle(status);
  const titleMax = Math.floor((w - 28) / 8);
  const lineMax = Math.floor((w - 28) / 6.6);
  const titleLines = lineCount(zone.title, titleMax);
  let cy = y + 62 + titleLines * 18;
  return (
    <g>
      <StatusBox x={x} y={y} w={w} h={h} status={status} rx={12} />
      <Tx x={x + 14} y={y + 26} size={11} weight={700} color={C.ink2} mono>
        {head}
      </Tx>
      <TxBlock x={x + 14} y={y + 50} text={zone.title} max={titleMax} size={15} lh={18} weight={700} color={s.ink} />
      {zone.lines.map((l) => {
        const at = cy;
        cy += lineCount(l, lineMax) * 16 + 6;
        return <TxBlock key={l} x={x + 14} y={at} text={l} max={lineMax} size={12.5} lh={16} color={C.ink} />;
      })}
    </g>
  );
}

/** One piece: what it reads, how it works, what it hands on. The three zones are drawn in the style of the piece's register
 *  status; the contract titles under the output are read from schemas/ by the page. */
export function PiecePlate({ name, role, status, doc, contractTitles }: { name: string; role: string; status: RegisterStatus; doc: PieceDoc; contractTitles: readonly string[] }) {
  const w = 290;
  const xs = [20, 345, 670];
  const zones: { head: string; zone: PieceZone }[] = [
    { head: "ENTRY", zone: doc.entry },
    { head: "MECHANISM", zone: doc.mechanism },
    { head: "OUTPUT", zone: doc.output },
  ];
  const zh = Math.max(150, ...zones.map((z) => zoneHeight(z.zone, w)));
  const mid = 52 + zh / 2;
  const bottom = 52 + zh;
  const total = bottom + (contractTitles.length > 0 ? 62 : 36);
  return (
    <Diagram w={980} h={total} label={`${name}: entry, mechanism and output.`}>
      <Tx x={20} y={30} size={18} weight={800} color={C.ink}>
        {name}
      </Tx>
      <Tx x={20 + name.length * 11 + 16} y={30} size={13} color={C.ink2} mono>
        {role}
      </Tx>
      <StatusLegend x={800} y={30} statuses={[status]} />
      {zones.map((z, i) => (
        <Zone key={z.head} x={xs[i] ?? 20} y={52} w={w} h={zh} head={z.head} zone={z.zone} status={status} />
      ))}
      <Arrow pts={[[312, mid], [343, mid]]} color={C.ink} width={2} />
      <Arrow pts={[[637, mid], [668, mid]]} color={C.ink} width={2} />
      {contractTitles.length > 0 ? (
        <Tx x={960} y={bottom + 22} size={12} color={C.ink2} anchor="end">
          {contractTitles.length > 1 ? "frozen contracts: " : "frozen contract: "}
          <tspan fontFamily="var(--font-mono)" fill="var(--ink)">{contractTitles.join(", ")}</tspan>
        </Tx>
      ) : null}
      <Tx x={20} y={total - 12} size={11.5} color={C.ink2} italic>
        Drawn in the style of its register status: {status}.
      </Tx>
    </Diagram>
  );
}
