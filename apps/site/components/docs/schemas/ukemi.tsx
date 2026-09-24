// apps/site/components/docs/schemas/ukemi.tsx: the schemas of the Ukemi page. What a stress test flags as eligible, what gets
// liquidated and what is left as a deficit are three different quantities (an illustration: no value is drawn); the
// prediction, the one-sided score and the upper bound the gate would hand back (the labels are the Ukemi page's own,
// lib/ukemi-copy.ts); and the calibration course, stratum by stratum, drawn from the committed course report (every count
// is read from apps/site/data/ukemi-course.json through its fail-closed loader).
import { Diagram, Tx, Ln, Box, Arrow, Rule, Dot, TxBlock, C } from "../svg-kit";

/** Eligible, liquidated, left as a deficit: three quantities, drawn as three bars of decreasing width. An illustration. */
export function EligibleSchema() {
  return (
    <Diagram w={980} h={360} label="Eligible is not liquidated: what a stress test flags, what gets liquidated and what is left as a deficit are three quantities.">
      <Tx x={40} y={34} size={13} weight={700} color={C.ink}>
        Three quantities a stress test tends to merge
      </Tx>
      <Box x={40} y={60} w={880} h={54} rx={10} fill={C.deferBg} stroke={C.defer} width={1.6} />
      <Tx x={56} y={84} size={14} weight={700} color={C.ink}>
        Eligible for liquidation
        <Ln x={56} dy={18}>
          <tspan fontSize={12} fontWeight={400} fill="var(--ink2)">every position a price path pushes past its threshold</tspan>
        </Ln>
      </Tx>
      <Box x={40} y={140} w={520} h={54} rx={10} fill={C.surface} stroke={C.act} width={2} />
      <Tx x={56} y={164} size={14} weight={700} color={C.ink}>
        Liquidated
        <Ln x={56} dy={18}>
          <tspan fontSize={12} fontWeight={400} fill="var(--ink2)">repaid in parts: a position re-buffers after each call</tspan>
        </Ln>
      </Tx>
      <Box x={40} y={220} w={140} h={54} rx={10} fill={C.soft} stroke={C.abstain} width={1.6} dashed />
      <Tx x={56} y={244} size={14} weight={700} color={C.ink}>
        Deficit
        <Ln x={56} dy={18}>
          <tspan fontSize={12} fontWeight={400} fill="var(--ink2)">often none</tspan>
        </Ln>
      </Tx>
      <Tx x={200} y={244} size={12} color={C.ink}>
        left only when something breaks the price path: a jump no liquidator can step through,
        <Ln x={200} dy={17}>
          a lagging oracle, or a pool too thin to absorb the sale
        </Ln>
      </Tx>
      <Arrow pts={[[600, 150], [600, 124]]} color={C.ink2} width={1.4} />
      <Tx x={610} y={170} size={12} color={C.ink2}>
        the gap Ukemi measures, per account
      </Tx>
      <Tx x={40} y={318} size={12.5} color={C.ink}>
        A single figure for the three would be a guess. Ukemi measures the first two on a recorded episode, account by account,
        <Ln x={40} dy={18}>
          and states the deficit apart.
        </Ln>
      </Tx>
      <Tx x={940} y={350} size={11} color={C.ink2} anchor="end" italic>
        An illustration: the widths carry no value.
      </Tx>
    </Diagram>
  );
}

/** The prediction, the score and the bound: y-hat is the most liquidable in one call at the first crossing; the score is how
 *  far the realized amount exceeds it; the region is an upper bound over an open floor. Labels from lib/ukemi-copy.ts. */
export function UpperBoundSchema({ upperLabel, yhatLabel, floorLabel }: { upperLabel: string; yhatLabel: string; floorLabel: string }) {
  const floorX = 80;
  const yhatX = 430;
  const upX = 760;
  return (
    <Diagram w={980} h={300} label="The prediction, the score and the upper bound: the region runs from an open floor to y-hat plus q-hat.">
      <Tx x={40} y={34} size={13} weight={700} color={C.ink}>
        One account in one stratum
      </Tx>
      <Rule x1={floorX} y1={120} x2={900} y2={120} color={C.ink2} width={1.4} />
      <rect x={floorX} y={100} width={upX - floorX} height={40} rx={6} fill={C.soft} stroke={C.act} strokeWidth={2} />
      <Rule x1={floorX} y1={88} x2={floorX} y2={152} color={C.ink2} width={1.6} dashed />
      <Tx x={floorX} y={176} size={12} color={C.ink2} anchor="middle">
        {floorLabel}
      </Tx>
      <Rule x1={yhatX} y1={84} x2={yhatX} y2={156} color={C.ink} width={2.4} />
      <Tx x={yhatX} y={76} size={13} weight={700} color={C.ink} anchor="middle">
        {yhatLabel}
      </Tx>
      <Rule x1={upX} y1={84} x2={upX} y2={156} color={C.act} width={2.4} />
      <Tx x={upX} y={76} size={13} weight={700} color={C.act} anchor="middle">
        {upperLabel}
      </Tx>
      <Rule x1={yhatX} y1={166} x2={upX} y2={166} color={C.act} width={1.4} />
      <Rule x1={yhatX} y1={160} x2={yhatX} y2={172} color={C.act} width={1.4} />
      <Rule x1={upX} y1={160} x2={upX} y2={172} color={C.act} width={1.4} />
      <Tx x={(yhatX + upX) / 2} y={186} size={12} color={C.act} anchor="middle">
        q-hat, the margin of the stratum
      </Tx>
      <Dot cx={620} cy={120} r={7} color={C.commit} />
      <Tx x={620} y={210} size={11.5} color={C.commit} anchor="middle">
        a realized amount under the bound
      </Tx>
      <Dot cx={840} cy={120} r={7} color={C.abstain} />
      <Tx x={840} y={230} size={11.5} color={C.abstain} anchor="middle">
        one above it: a miss
      </Tx>
      <Tx x={40} y={262} size={12.5} color={C.ink}>
        y-hat: the most the protocol&rsquo;s rule lets be liquidated in one call, at the first crossing on the recorded path.
        <Ln x={40} dy={18}>
          The score is how far the realized amount went above y-hat, zero when it did not; q-hat is a quantile of those scores.
        </Ln>
      </Tx>
    </Diagram>
  );
}

export interface StratumBar {
  label: string;
  range: string;
  n: number;
  floor: number;
  meetsFloor: boolean;
  outcome: string;
}

/** The calibration course, stratum by stratum: each bar is the count of fresh calibration points, the tick is the floor
 *  below which the stratum abstains. Every count is read from the committed course report. */
export function StrataSchema({ strata, unitNote }: { strata: readonly StratumBar[]; unitNote: string }) {
  const x0 = 360;
  const x1 = 860;
  const top = Math.max(1, ...strata.map((s) => Math.max(s.n, s.floor)));
  const xOf = (v: number): number => x0 + ((x1 - x0) * v) / (top * 1.08);
  const rowH = 58;
  const h = 96 + strata.length * rowH + 40;
  return (
    <Diagram w={980} h={h} label="The calibration course, stratum by stratum: fresh calibration points against the floor of each stratum.">
      <Tx x={40} y={34} size={13} weight={700} color={C.ink}>
        Fresh calibration points per stratum, against the floor
      </Tx>
      <TxBlock x={40} y={56} text={unitNote} max={150} size={11} lh={14} color={C.ink2} />
      {strata.map((s, i) => {
        const y = 86 + i * rowH;
        const end = xOf(s.n);
        const tick = xOf(s.floor);
        const labelW = String(s.n).length * 7.4 + 8;
        // The count sits right after its bar, or right after the floor's tick when the tick is in the way.
        const lx = end < tick && end + 8 + labelW > tick - 4 ? tick + 8 : end + 8;
        return (
          <g key={s.label}>
            <Tx x={40} y={y + 20} size={13} weight={700} color={C.ink}>
              {s.label}
            </Tx>
            <Tx x={40} y={y + 38} size={11} color={C.ink2} mono>
              {s.range}
            </Tx>
            <rect x={x0} y={y + 8} width={Math.max(2, end - x0)} height={26} rx={4} fill={s.meetsFloor ? C.act : C.soft} stroke={s.meetsFloor ? C.act : C.ink2} strokeWidth={1.2} />
            <Rule x1={tick} y1={y} x2={tick} y2={y + 42} color={C.abstain} width={2} />
            <Tx x={lx} y={y + 26} size={12} color={C.ink} mono>
              {s.n}
            </Tx>
            <Tx x={x0} y={y + 52} size={11} color={s.meetsFloor ? C.ink : C.abstain}>
              {s.outcome}
            </Tx>
          </g>
        );
      })}
      <Rule x1={xOf(strata[0]?.floor ?? 0)} y1={h - 30} x2={xOf(strata[0]?.floor ?? 0)} y2={h - 16} color={C.abstain} width={2} />
      <Tx x={xOf(strata[0]?.floor ?? 0) - 8} y={h - 18} size={11.5} color={C.abstain} anchor="end">
        the floor: fewer points than this and the stratum abstains, under_calib
      </Tx>
    </Diagram>
  );
}
