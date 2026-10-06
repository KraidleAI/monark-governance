// apps/site/components/docs/schemas/narabi.tsx: the schemas of the Narabi page. One window a day, from the end of a UTC day
// to the published line and the external probe (the publication slots and the probe's deadline are read from the committed
// served facts, apps/site/data/narabi-served.json); and the tracker's threshold over the published lines, drawn from the
// committed capture of the two published files (apps/site/data/narabi-capture.json). Adapted from the pitch deck's Narabi
// plate. Every value drawn is read from data; the axes carry no typed number.
import { Diagram, Tx, Ln, Box, Arrow, Rule, Dot, TxBlock, C } from "../svg-kit";

/** One window a day: the day closes, the reads wait for finality, the flow is attested and scored, the tracker steps, the
 *  line is chained and published, and a probe on another host checks it by a deadline. */
export function NarabiDaySchema({ slots, deadline, quorum }: { slots: readonly string[]; deadline: string; quorum: string }) {
  const steps: { head: string; body: string }[] = [
    { head: "A UTC DAY CLOSES", body: "its block range is fixed from the chain: from_block to to_block" },
    { head: "FINALITY", body: "a window whose closing block is not final yet is lag, never a skipped step" },
    { head: "THE READS", body: quorum },
    { head: "THE FLOW", body: "burns, mints and supply become an attested flow, then a velocity score" },
    { head: "THE TRACKER", body: "the quantile threshold steps once, on the realized outcome; T grows by one" },
    { head: "THE LINE", body: "hashed with the hash of the line before it, then appended to the timeline" },
  ];
  const w = 148;
  const gap = 12;
  return (
    <Diagram w={980} h={330} label="One window a day: the day closes, the reads wait for finality, the flow is scored, the tracker steps, the line is chained and published.">
      {steps.map((s, i) => {
        const x = 20 + i * (w + gap);
        return (
          <g key={s.head}>
            <Box x={x} y={30} w={w} h={150} rx={12} fill={C.surface} stroke={C.narabi} width={1.8} />
            <Tx x={x + 12} y={54} size={10.5} weight={700} color={C.narabi} mono>
              {s.head}
            </Tx>
            <TxBlock x={x + 12} y={78} text={s.body} max={20} size={12} lh={15} color={C.ink} />
            {i < steps.length - 1 ? <Arrow pts={[[x + w + 1, 105], [x + w + gap - 1, 105]]} color={C.ink} width={1.6} /> : null}
          </g>
        );
      })}
      <Arrow pts={[[894, 180], [894, 212], [720, 212]]} color={C.ink} width={1.6} />
      <Box x={420} y={196} w={296} h={70} rx={12} fill={C.soft} stroke={C.ink} width={1.6} />
      <Tx x={436} y={222} size={13} weight={700} color={C.ink}>
        Published at /narabi/
        <Ln x={436} dy={18}>
          <tspan fontFamily="var(--font-mono)" fontSize={11} fontWeight={400}>state.json · timeline.jsonl</tspan>
        </Ln>
      </Tx>
      <Tx x={436} y={286} size={11.5} color={C.ink2}>
        tried at the UTC slots {slots.join(", ")}
      </Tx>
      <Arrow pts={[[420, 231], [340, 231]]} color={C.gate} width={1.6} dashed />
      <Box x={20} y={196} w={316} h={96} rx={12} fill={C.surface} stroke={C.gate} width={1.6} dashed />
      <Tx x={36} y={222} size={13} weight={700} color={C.ink}>
        A probe on another host
        <Ln x={36} dy={18}>
          <tspan fontSize={11.5} fontWeight={400}>reads the published files by {deadline} UTC:</tspan>
        </Ln>
        <Ln x={36} dy={16}>
          <tspan fontSize={11.5} fontWeight={400}>is the last window there, does the chain</tspan>
        </Ln>
        <Ln x={36} dy={16}>
          <tspan fontSize={11.5} fontWeight={400}>hold, does the state match the last line?</tspan>
        </Ln>
      </Tx>
    </Diagram>
  );
}

export interface TrackerPoint {
  T: number;
  q_before: number;
  q_after: number;
  stepped: boolean;
  miss: boolean;
}

/** The tracker's threshold over the published lines, with the committed threshold the gate reads drawn apart. Values are
 *  read from the committed capture; the axis is scaled from them, and no tick carries a typed number. */
export function TrackerSchema({ points, q1, lastDay, T }: { points: readonly TrackerPoint[]; q1: number; lastDay: string; T: number }) {
  const x0 = 90;
  const x1 = 900;
  const y0 = 60;
  const y1 = 250;
  const values = [q1, ...points.flatMap((p) => [p.q_before, p.q_after])];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo === 0 ? 1 : hi - lo;
  const yOf = (v: number): number => y1 - ((v - lo) / span) * (y1 - y0);
  const n = Math.max(1, points.length);
  const xOf = (i: number): number => x0 + ((x1 - x0) * (i + 0.5)) / n;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${String(xOf(i))},${String(yOf(p.q_after))}`).join(" ");
  return (
    <Diagram w={980} h={336} label="The tracker's threshold after each published window, with the committed threshold the gate reads drawn apart.">
      <Tx x={40} y={34} size={13} weight={700} color={C.ink}>
        The tracker&rsquo;s threshold after each published window
      </Tx>
      <Rule x1={x0} y1={y1 + 10} x2={x1} y2={y1 + 10} color={C.rule} width={1} />
      <Rule x1={x0} y1={yOf(q1)} x2={x1} y2={yOf(q1)} color={C.gate} width={1.6} dashed />
      <Tx x={x1} y={yOf(q1) - 8} size={11.5} color={C.gate} anchor="end">
        the committed threshold the gate reads, q₁
      </Tx>
      <path d={path} fill="none" stroke={C.narabi} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={String(i)}>
          <Dot cx={xOf(i)} cy={yOf(p.q_after)} r={p.stepped ? 5 : 3.5} color={p.miss ? C.abstain : C.narabi} />
        </g>
      ))}
      <Tx x={x0} y={y1 + 30} size={11.5} color={C.ink2}>
        one dot per published window, oldest on the left; a small dot is a window where the tracker did not step;
        <Ln x={x0} dy={18}>
          a red dot is a window whose score exceeded the threshold before the step
        </Ln>
      </Tx>
      <Tx x={x0} y={y1 + 68} size={11.5} color={C.ink2}>
        last window {lastDay}, T = {T}; the vertical axis is scaled to the values it shows
      </Tx>
    </Diagram>
  );
}
