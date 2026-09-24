// apps/site/components/docs/schemas/overview.tsx: the two schemas of the documentation overview. The knife (one engine as
// the handle, the applications as the blades, the door as the ring) and the floors (sensors, gate, acts, door) with the two
// directions that meet at the same contract. Adapted from the pitch deck's knife and floors plates, redrawn in the site's
// charter: every name and status is read from the fleet register, the contract titles and the count from schemas/, the
// served tools from the committed harness facts. Nothing here is typed that the register or the data carry.
import { FLEET_AGENTS, PRODUCTS, countWord, type FleetAgent } from "@/lib/fleet";
import { Diagram, Tx, Ln, Box, StatusChip, StatusLegend, statusStyle, Arrow, C, type RegisterStatus } from "../svg-kit";

function statusesIn(items: readonly { status: RegisterStatus }[]): RegisterStatus[] {
  return [...new Set(items.map((i) => i.status))].sort();
}

/** A list cut into pairs, for a column too narrow for one line. */
function pairs<T>(xs: readonly T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += 2) out.push(xs.slice(i, i + 2));
  return out;
}

/** The open blades pivot at one point inside the handle's right end and fan out at these angles (SVG rotation, degrees). The
 *  drawing is laid out for as many open blades as there are angles; one more needs a new layout, and the build says so
 *  instead of drawing it wrong. */
const PIVOT_X = 655;
const PIVOT_Y = 204;
const BLADE_ANGLES: readonly number[] = [-24, -2];
const BLADE_LENGTH = 290;
const BLADE_HALF = 33;

/** A blade lying along the x axis from the pivot: a straight spine on top, an edge that curves up to the point. */
function bladePath(): string {
  const tip = PIVOT_X + BLADE_LENGTH;
  const top = PIVOT_Y - BLADE_HALF;
  const bottom = PIVOT_Y + BLADE_HALF;
  return `M${String(PIVOT_X)},${String(top)} L${String(tip)},${String(top)} Q${String(tip)},${String(bottom)} ${String(tip - 50)},${String(bottom)} L${String(PIVOT_X)},${String(bottom)} Z`;
}

function agentByRole(role: FleetAgent["role"]): FleetAgent {
  const a = FLEET_AGENTS.find((x) => x.role === role);
  if (a === undefined) throw new Error(`docs overview: the register holds no ${role}`);
  return a;
}

/** The knife: the engine is the handle (the AI side), the applications are the blades (the DeFi side), and the ring is
 *  the door other agents hold. An application's blade is open when the register says built, folded and dashed when not. */
export function KnifeSchema({ contractCount, toolNames }: { contractCount: number; toolNames: readonly string[] }) {
  const open = PRODUCTS.filter((p) => p.status === "built");
  const folded = PRODUCTS.filter((p) => p.status !== "built");
  const sensors = FLEET_AGENTS.filter((a) => a.role === "sensor");
  const gate = agentByRole("gate");
  const statuses = statusesIn([...PRODUCTS, ...FLEET_AGENTS]);
  return (
    <Diagram w={980} h={560} label="The MONARK knife: one engine as the handle, the applications as the blades, the door as the ring.">
      <Tx x={40} y={36} size={13} weight={700} color={C.gate} mono>
        AI SIDE · THE ENGINE, THE HANDLE
      </Tx>
      <Tx x={940} y={36} size={13} weight={700} color={C.bell} mono anchor="end">
        DEFI SIDE · THE APPLICATIONS, THE BLADES
      </Tx>

      {/* The open blades (built applications), fanned from the pivot and drawn last first, so that the first blade's words
          stay on top where two blades cross near the handle. */}
      {open
        .map((p, i) => ({ p, i }))
        .reverse()
        .map(({ p, i }) => {
          const angle = BLADE_ANGLES[i];
          if (angle === undefined) throw new Error(`docs overview: the knife is laid out for ${String(BLADE_ANGLES.length)} open blades, the register has ${String(open.length)} (fail-closed)`);
          return (
            <g key={p.key} transform={`rotate(${String(angle)} ${String(PIVOT_X)} ${String(PIVOT_Y)})`}>
              <path d={bladePath()} fill={C.bellBg} stroke={C.bell} strokeWidth={2} />
              <Tx x={PIVOT_X + 180} y={PIVOT_Y - 1} size={16} weight={700} color={C.ink} anchor="middle">
                {p.name}
              </Tx>
              <Tx x={PIVOT_X + 180} y={PIVOT_Y + 16} size={11} color={C.ink2} anchor="middle">
                {p.segment}
              </Tx>
            </g>
          );
        })}

      {/* The sensors ride above the handle: they attest, the gate decides. */}
      <Tx x={214} y={112} size={11} color={C.ink2} mono>
        sensors that attest
      </Tx>
      {sensors.map((a, i) => (
        <StatusChip key={a.name} x={214 + i * 118} y={124} w={108} h={28} status={a.status} name={a.name} size={12} />
      ))}

      {/* The handle: the engine. */}
      <rect x={190} y={170} width={560} height={130} rx={65} fill={C.ink} />
      <Tx x={254} y={214} size={22} weight={800} color={C.bg}>
        MONARK engine
      </Tx>
      <Tx x={254} y={240} size={13} color={C.bg}>
        {gate.name}, the gate: commit, defer or abstain
        <Ln x={254} dy={19}>
          B_t, the budget the caller carries, returned unchanged
        </Ln>
        <Ln x={254} dy={19}>
          {countWord(contractCount)} frozen contracts, no confidence field
        </Ln>
      </Tx>
      <circle cx={224} cy={235} r={9} fill={C.narabi} />
      <circle cx={716} cy={235} r={9} fill={C.narabi} />

      {/* The ring: the door other agents hold. */}
      <circle cx={148} cy={235} r={34} fill="none" stroke={C.narabi} strokeWidth={7} />
      <Tx x={40} y={318} size={13} weight={600} color={C.ink}>
        The ring: the door
        <Ln x={40} dy={18}>
          other agents hold,
        </Ln>
        <Ln x={40} dy={18}>
          over MCP and HTTP
        </Ln>
      </Tx>
      {toolNames.map((t, i) => (
        <Tx key={t} x={40} y={384 + i * 16} size={11} color={C.ink2} mono>
          {t}
        </Tx>
      ))}

      {/* The folded blades (applications not built yet), engraved along the handle's lower edge. */}
      {folded.map((p, i) => {
        const y = 312 + i * 28;
        const s = statusStyle(p.status);
        return (
          <g key={p.key}>
            <rect x={320 + i * 10} y={y} width={400 - i * 20} height={22} rx={11} fill={s.fill} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dashed ? "6 5" : undefined} />
            <Tx x={336 + i * 10} y={y + 15} size={12} weight={600} color={s.ink}>
              {p.name}
            </Tx>
            <Tx x={708 - i * 10} y={y + 15} size={11} color={C.ink2} anchor="end">
              {p.segment}
            </Tx>
          </g>
        );
      })}
      <Tx x={760} y={336} size={12} color={C.ink2}>
        folded: named applications,
        <Ln x={760} dy={17}>
          each one cleared by
        </Ln>
        <Ln x={760} dy={17}>
          the same gate
        </Ln>
      </Tx>

      <StatusLegend x={40} y={506} statuses={statuses} />
      <Tx x={940} y={510} size={15} weight={700} color={C.ink} anchor="end">
        One handle. Several blades. The same grip for an AI agent and for DeFi.
      </Tx>
    </Diagram>
  );
}

/** The floors: sensors attest, the gate decides, acts execute on commit, the door lets other agents in. The inference side
 *  and the DeFi side meet at the same contract and the same gate. */
export function FloorsSchema({ predictionTitle, verdictTitle, decisionTitle, toolNames }: { predictionTitle: string; verdictTitle: string; decisionTitle: string; toolNames: readonly string[] }) {
  const gate = agentByRole("gate");
  const door = agentByRole("distribution");
  const rows: { y: number; head: string; verb: string }[] = [
    { y: 64, head: "SENSORS", verb: "attest" },
    { y: 176, head: "THE GATE", verb: "decides" },
    { y: 288, head: "ACTS", verb: "execute on commit" },
    { y: 400, head: "THE DOOR", verb: "lets other agents in" },
  ];
  const statuses = statusesIn([gate, door]);
  return (
    <Diagram w={980} h={560} label="Four floors and two directions: a model's answer and an onchain flow enter through the same contract and meet the same gate.">
      <Tx x={265} y={40} size={13} weight={700} color={C.gate} mono anchor="middle">
        INFERENCE SIDE
      </Tx>
      <Tx x={490} y={40} size={13} weight={700} color={C.ink} mono anchor="middle">
        THE SAME DOOR
      </Tx>
      <Tx x={765} y={40} size={13} weight={700} color={C.bell} mono anchor="middle">
        DEFI SIDE
      </Tx>
      {rows.map((r) => (
        <g key={r.head}>
          <Box x={20} y={r.y} w={940} h={100} rx={12} fill={C.surface} stroke={C.rule} />
          <Tx x={36} y={r.y + 34} size={14} weight={800} color={C.ink}>
            {r.head}
          </Tx>
          <Tx x={36} y={r.y + 54} size={12} color={C.ink2}>
            {r.verb}
          </Tx>
        </g>
      ))}

      {/* Inference side, one line per floor. */}
      <Tx x={176} y={100} size={12} color={C.ink}>
        a model&rsquo;s answer, any provider;
        <Ln x={176} dy={17}>
          bring your own scores
        </Ln>
      </Tx>
      <Tx x={176} y={212} size={12} color={C.ink}>
        one region per task class,
        <Ln x={176} dy={17}>
          never a score
        </Ln>
      </Tx>
      <Tx x={176} y={324} size={12} color={C.ink}>
        the agent&rsquo;s own action,
        <Ln x={176} dy={17}>
          taken on commit only
        </Ln>
      </Tx>
      <Tx x={176} y={436} size={12} color={C.ink}>
        an agent calls a tool
        <Ln x={176} dy={17}>
          over MCP or HTTP
        </Ln>
      </Tx>
      <Arrow pts={[[340, 110], [378, 110]]} color={C.gate} width={2} />

      {/* The shared column. */}
      <rect x={384} y={52} width={212} height={460} rx={14} fill={C.soft} stroke={C.ink} strokeWidth={1.6} />
      <Tx x={400} y={92} size={12} color={C.ink2}>
        both sides become the same
        <Ln x={400} dy={20}>
          <tspan fontFamily="var(--font-mono)" fontWeight={700} fill="var(--ink)">
            {predictionTitle}
          </tspan>
        </Ln>
      </Tx>
      <StatusChip x={400} y={186} w={120} h={28} status={gate.status} name={gate.name} size={12} />
      <Tx x={400} y={232} size={11.5} color={C.ink}>
        <tspan fontFamily="var(--font-mono)" fontWeight={700}>
          {verdictTitle}
        </tspan>
        <Ln x={400} dy={17}>
          <tspan fontFamily="var(--font-mono)" fontWeight={700}>
            {decisionTitle}
          </tspan>
        </Ln>
      </Tx>
      <Tx x={400} y={322} size={12} color={C.ink}>
        acts read the decision
        <Ln x={400} dy={17}>
          and move on commit only
        </Ln>
      </Tx>
      <StatusChip x={400} y={412} w={120} h={28} status={door.status} name={door.name} size={12} />
      <Tx x={400} y={460} size={11} color={C.ink}>
        served today by the harness:
      </Tx>
      {pairs(toolNames).map((pair, i) => (
        <Tx key={pair.join("-")} x={400} y={477 + i * 15} size={11} color={C.ink} mono>
          {pair.join(" · ")}
        </Tx>
      ))}

      {/* DeFi side, one line per floor. */}
      <Tx x={628} y={100} size={12} color={C.ink}>
        attested onchain flows, a lending
        <Ln x={628} dy={17}>
          book at a block, tokenized fills
        </Ln>
      </Tx>
      <Arrow pts={[[626, 132], [602, 132]]} color={C.bell} width={2} />
      <Tx x={628} y={212} size={12} color={C.ink}>
        the same region logic and budget,
        <Ln x={628} dy={17}>
          the same closed list of answers
        </Ln>
      </Tx>
      <Tx x={628} y={324} size={12} color={C.ink}>
        exit a range, ease a position,
        <Ln x={628} dy={17}>
          publish a record: on commit
        </Ln>
      </Tx>
      <Tx x={628} y={436} size={12} color={C.ink}>
        a transfer, a swap, a signature:
        <Ln x={628} dy={17}>
          the same door, the same answer
        </Ln>
      </Tx>

      <StatusLegend x={36} y={540} statuses={statuses} />
      <Tx x={944} y={544} size={13} weight={700} color={C.ink} anchor="end">
        A model&rsquo;s answer and an onchain flow enter through the same door.
      </Tx>
    </Diagram>
  );
}
