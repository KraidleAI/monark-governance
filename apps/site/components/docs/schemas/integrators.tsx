// apps/site/components/docs/schemas/integrators.tsx: the schemas of the integration page. How an agent reaches the engine
// (adapted from the pitch deck's reaching plate, without any platform: the endpoints, the tools and their served notes are
// read from the committed harness facts), and the bring-your-own loop, drawn from the loop recorded over the MCP transport
// (the digests and the answer are read from the committed trace). No value is typed here.
import { Diagram, Tx, Ln, Box, Arrow, TxBlock, lineCount, C } from "../svg-kit";

/** The wrap budget of a tool's served note, in characters: the same for the layout and for the drawing. */
const NOTE_MAX = 36;

/** An agent reaches the engine over MCP or the HTTP mirror, calls one of the served tools, and gets a frozen decision back. */
export function ReachSchema({ mcpUrl, apiUrl, tools, decisionTitle }: { mcpUrl: string; apiUrl: string; tools: readonly { name: string; note: string }[]; decisionTitle: string }) {
  const rows = tools.map((t) => ({ ...t, lines: lineCount(t.note, NOTE_MAX) }));
  const toolsH = rows.reduce((acc, r) => acc + 24 + r.lines * 14, 0) + 34;
  const h = Math.max(300, toolsH + 60);
  let cy = 64;
  return (
    <Diagram w={980} h={h} label="An agent reaches the engine over MCP or the HTTP mirror, calls a served tool and gets a frozen decision back.">
      <Box x={20} y={40} w={200} h={120} rx={12} fill={C.surface} stroke={C.ink} width={1.8} />
      <Tx x={36} y={68} size={15} weight={800} color={C.ink}>
        Your agent
        <Ln x={36} dy={22}>
          <tspan fontSize={12} fontWeight={400} fill="var(--ink2)">any MCP client, or any</tspan>
        </Ln>
        <Ln x={36} dy={16}>
          <tspan fontSize={12} fontWeight={400} fill="var(--ink2)">program that can POST</tspan>
        </Ln>
        <Ln x={36} dy={16}>
          <tspan fontSize={12} fontWeight={400} fill="var(--ink2)">no account, e-mail or wallet</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[220, 80], [270, 80]]} color={C.gate} width={2} />
      <Arrow pts={[[220, 130], [270, 130]]} color={C.ink2} width={2} />
      <Box x={274} y={40} w={250} h={56} rx={10} fill={C.surface} stroke={C.gate} width={1.8} />
      <Tx x={288} y={62} size={12} weight={700} color={C.gate} mono>
        MCP, streamable HTTP
        <Ln x={288} dy={18}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink)">{mcpUrl}</tspan>
        </Ln>
      </Tx>
      <Box x={274} y={106} w={250} h={56} rx={10} fill={C.surface} stroke={C.ink2} width={1.6} />
      <Tx x={288} y={128} size={12} weight={700} color={C.ink2} mono>
        plain HTTP mirror
        <Ln x={288} dy={18}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink)">{apiUrl}</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[524, 100], [560, 100]]} color={C.ink} width={2} />
      <Box x={564} y={40} w={250} h={toolsH} rx={12} fill={C.soft} stroke={C.ink} width={1.6} />
      <Tx x={578} y={60} size={11} weight={700} color={C.ink2} mono>
        THE SERVED TOOLS
      </Tx>
      {rows.map((r) => {
        const at = cy + 10;
        cy += 24 + r.lines * 14;
        return (
          <g key={r.name}>
            <Tx x={578} y={at + 4} size={13} weight={700} color={C.ink} mono>
              {r.name}
            </Tx>
            <TxBlock x={578} y={at + 20} text={r.note} max={NOTE_MAX} size={11} lh={14} color={C.ink2} />
          </g>
        );
      })}
      <Arrow pts={[[814, 100], [846, 100]]} color={C.ink} width={2} />
      <rect x={850} y={40} width={110} height={120} rx={12} fill={C.ink} />
      <Tx x={905} y={78} size={12} weight={700} color={C.bg} anchor="middle" mono>
        {decisionTitle}
      </Tx>
      <Tx x={905} y={104} size={11} color={C.bg} anchor="middle">
        commit, defer
        <Ln x={905} dy={15}>
          or abstain,
        </Ln>
        <Ln x={905} dy={15}>
          and why
        </Ln>
      </Tx>
    </Diagram>
  );
}

const short = (hex: string): string => `${hex.slice(0, 12)}…`;

/** The bring-your-own loop: calibrate on your scores, then gate your prediction under them; the audit closes when the
 *  decision's scores digest equals the digest of the scores you calibrated. Digests read from the recorded loop. */
export function ByoLoopSchema({ calibrateSha, verdictSha, action, reason }: { calibrateSha: string; verdictSha: string; action: string; reason: string }) {
  const closes = calibrateSha === verdictSha;
  return (
    <Diagram w={980} h={300} label="The bring-your-own loop: calibrate on your own scores, then gate your prediction under them; the digests tie the two calls.">
      <Box x={20} y={30} w={290} h={120} rx={12} fill={C.surface} stroke={C.gate} width={1.8} />
      <Tx x={36} y={58} size={14} weight={800} color={C.ink}>
        First: calibrate
        <Ln x={36} dy={22}>
          <tspan fontSize={12} fontWeight={400}>you send your nonconformity scores,</tspan>
        </Ln>
        <Ln x={36} dy={16}>
          <tspan fontSize={12} fontWeight={400}>a miscoverage level and a minimum count</tspan>
        </Ln>
        <Ln x={36} dy={22}>
          <tspan fontSize={11} fontWeight={400} fontFamily="var(--font-mono)">scores_sha256 {short(calibrateSha)}</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[310, 90], [370, 90]]} color={C.ink} width={2} />
      <Box x={374} y={30} w={300} h={120} rx={12} fill={C.surface} stroke={C.gate} width={1.8} />
      <Tx x={390} y={58} size={14} weight={800} color={C.ink}>
        Then: gate
        <Ln x={390} dy={22}>
          <tspan fontSize={12} fontWeight={400}>your prediction, your terms, and the same</tspan>
        </Ln>
        <Ln x={390} dy={16}>
          <tspan fontSize={12} fontWeight={400}>scores as the calibration parameter</tspan>
        </Ln>
        <Ln x={390} dy={22}>
          <tspan fontSize={11} fontWeight={400} fontFamily="var(--font-mono)">scores_sha256 {short(verdictSha)}</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[674, 90], [734, 90]]} color={C.ink} width={2} />
      <rect x={738} y={30} width={222} height={120} rx={12} fill={C.ink} />
      <Tx x={754} y={62} size={14} weight={800} color={C.bg}>
        The answer
        <Ln x={754} dy={24}>
          <tspan fontFamily="var(--font-mono)" fontSize={13}>{action} · {reason}</tspan>
        </Ln>
      </Tx>
      <Box x={20} y={176} w={940} h={96} rx={12} fill={closes ? C.soft : C.deferBg} stroke={closes ? C.commit : C.abstain} width={1.8} />
      <Tx x={40} y={206} size={14} weight={700} color={C.ink}>
        {closes ? "The audit closes: the two digests are equal." : "The two digests differ: the loop does not close."}
        <Ln x={40} dy={22}>
          <tspan fontSize={12.5} fontWeight={400}>
            The decision was gated against exactly the scores you calibrated. MONARK does not see your data or your model, and does
          </tspan>
        </Ln>
        <Ln x={40} dy={18}>
          <tspan fontSize={12.5} fontWeight={400}>not check that your numbers are nonconformity scores of any model: the coverage is yours to own.</tspan>
        </Ln>
      </Tx>
    </Diagram>
  );
}
