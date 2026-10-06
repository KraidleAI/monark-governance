// apps/site/components/docs/schemas/flow.tsx: a flow of steps, left to right, each drawn solid when what it names exists and
// is served today, dashed when it does not yet. The state of a step is never typed at the call site: the page derives it from
// the fleet register or from the committed served data and passes the boolean in. Used by the use cases and the verification
// page. The words of a step are the page's own (scanned digit-free by the root test).
import { Diagram, Tx, Box, Arrow, TxBlock, lineCount, C } from "../svg-kit";

export interface FlowStep {
  head: string;
  body: string;
  /** True when what the step names exists and is served today, derived by the page from the register or the served data. */
  today: boolean;
  /** The register name the step's state was read from, shown under the step (optional). */
  source?: string;
}

/** A flow of steps with a closing line under it. Wraps onto two rows when there are more than four steps. */
export function FlowSchema({ label, steps, footer }: { label: string; steps: readonly FlowStep[]; footer: string }) {
  const perRow = steps.length > 4 ? Math.ceil(steps.length / 2) : steps.length;
  const gap = 26;
  const w = Math.floor((940 - gap * (perRow - 1)) / perRow);
  const max = Math.floor((w - 24) / 6.5);
  const boxH = 50 + Math.max(...steps.map((s) => lineCount(s.body, max))) * 16 + 30;
  const rows = Math.ceil(steps.length / perRow);
  const h = 20 + rows * (boxH + 30) + 40;
  return (
    <Diagram w={980} h={h} label={label}>
      {steps.map((s, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const x = 20 + col * (w + gap);
        const y = 20 + row * (boxH + 30);
        const last = i === steps.length - 1;
        const endOfRow = col === perRow - 1;
        return (
          <g key={s.head}>
            <Box x={x} y={y} w={w} h={boxH} rx={12} fill={s.today ? C.surface : "none"} stroke={s.today ? C.ink : C.ink2} width={s.today ? 1.8 : 1.3} dashed={!s.today} />
            <TxBlock x={x + 12} y={y + 24} text={s.head} max={Math.floor((w - 24) / 7.6)} size={13} lh={16} weight={700} color={s.today ? C.ink : C.ink2} />
            <TxBlock x={x + 12} y={y + 50 + (lineCount(s.head, Math.floor((w - 24) / 7.6)) - 1) * 16} text={s.body} max={max} size={12} lh={16} color={C.ink} />
            <Tx x={x + 12} y={y + boxH - 10} size={10.5} color={s.today ? C.commit : C.ink2} mono>
              {s.today ? "today" : "not yet"}
              {s.source ? ` · ${s.source}` : ""}
            </Tx>
            {!last && !endOfRow ? <Arrow pts={[[x + w + 2, y + boxH / 2], [x + w + gap - 2, y + boxH / 2]]} color={C.ink} width={1.8} /> : null}
            {!last && endOfRow ? (
              <Arrow pts={[[x + w / 2, y + boxH + 2], [x + w / 2, y + boxH + 15], [20 + w / 2, y + boxH + 15], [20 + w / 2, y + boxH + 28]]} color={C.ink} width={1.6} />
            ) : null}
          </g>
        );
      })}
      <Tx x={20} y={h - 16} size={12} color={C.ink2} italic>
        {footer}
      </Tx>
    </Diagram>
  );
}
