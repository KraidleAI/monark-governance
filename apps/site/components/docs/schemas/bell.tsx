// apps/site/components/docs/schemas/bell.tsx: the schemas of the MONARK Bell page. The New York day, session by session (the
// bounds are read from lib/bell-method.ts, which a root test pins to the collector); the path from fills to a signed line (the
// three steps are the register's own wiring of MONARK Bell); the two readings of the close that must agree before a gap is
// computed; and the chain of the served timeline, drawn from the committed facts of its lines (apps/site/data/bell-served.json).
// Adapted from the pitch deck's Bell plate and redrawn for a record that is served today. No value is typed here.
import { Diagram, Tx, Ln, Box, Arrow, Rule, TxBlock, lineCount, C } from "../svg-kit";

/** Minutes after midnight of an "HH:MM" wall-clock bound (the bounds are data, parsed here only to place them). */
function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (h === undefined || m === undefined || !Number.isInteger(h) || !Number.isInteger(m)) throw new Error(`bell day: malformed bound ${hhmm}`);
  return h * 60 + m;
}

export interface SessionBounds {
  preOpen: string;
  regularOpen: string;
  regularClose: string;
  regularCloseHalfDay: string;
  afterClose: string;
  afterCloseHalfDay: string;
}

/** One New York trading day on the wall clock: the cash sessions and the off-hours on both sides, with the bounds read from
 *  the method constants. Below, the three off-hours regimes a gap can belong to. */
export function BellDaySchema({ bounds }: { bounds: SessionBounds }) {
  const x0 = 60;
  const x1 = 920;
  const xOf = (hhmm: string): number => x0 + ((x1 - x0) * minutesOf(hhmm)) / (24 * 60);
  const seg = [
    { from: x0, to: xOf(bounds.preOpen), name: "overnight", cash: false },
    { from: xOf(bounds.preOpen), to: xOf(bounds.regularOpen), name: "pre", cash: true },
    { from: xOf(bounds.regularOpen), to: xOf(bounds.regularClose), name: "regular", cash: true },
    { from: xOf(bounds.regularClose), to: xOf(bounds.afterClose), name: "after", cash: true },
    { from: xOf(bounds.afterClose), to: x1, name: "overnight", cash: false },
  ];
  const marks = [bounds.preOpen, bounds.regularOpen, bounds.regularClose, bounds.afterClose];
  return (
    <Diagram w={980} h={340} label="One New York trading day: pre, regular and after hours, with the off-hours on both sides.">
      <Tx x={40} y={34} size={13} weight={700} color={C.ink}>
        One trading day, New York wall clock, daylight saving applied per date
      </Tx>
      {seg.map((s, i) => (
        <g key={`${s.name}-${String(i)}`}>
          <rect x={s.from} y={70} width={s.to - s.from} height={58} fill={s.cash ? C.lavBg : C.bellBg} stroke={s.cash ? C.lav : C.bell} strokeWidth={1.4} />
          <Tx x={(s.from + s.to) / 2} y={104} size={13} weight={700} color={C.ink} anchor="middle">
            {s.name}
          </Tx>
        </g>
      ))}
      {marks.map((m) => (
        <g key={m}>
          <Rule x1={xOf(m)} y1={62} x2={xOf(m)} y2={140} color={C.ink} width={1.2} />
          <Tx x={xOf(m)} y={156} size={12} color={C.ink} anchor="middle" mono>
            {m}
          </Tx>
        </g>
      ))}
      <Tx x={xOf(bounds.regularClose)} y={174} size={10.5} color={C.ink2} anchor="middle">
        {bounds.regularCloseHalfDay} on a half-day
      </Tx>
      <Tx x={xOf(bounds.afterClose)} y={188} size={10.5} color={C.ink2} anchor="middle">
        {bounds.afterCloseHalfDay} on a half-day
      </Tx>
      <Box x={40} y={210} w={900} h={108} rx={12} fill={C.surface} stroke={C.rule} />
      <Tx x={60} y={236} size={12} weight={700} color={C.bell} mono>
        AN OFF-HOURS GAP BELONGS TO ONE REGIME
      </Tx>
      <Tx x={60} y={260} size={12.5} color={C.ink}>
        overnight-weekday: from the end of after-hours to the next pre-open, a night with no weekend and no closure in it
        <Ln x={60} dy={19}>
          weekend: a gap with a Saturday or a Sunday in it
        </Ln>
        <Ln x={60} dy={19}>
          holiday: a gap with a full closure in it; a weekend around it does not change the regime
        </Ln>
      </Tx>
    </Diagram>
  );
}

/** From fills to a signed line: the collector reads, the publisher checks, the host publishes, a reader verifies. The first
 *  three texts are MONARK Bell's own wiring in the fleet register. */
export function BellPipelineSchema({ sensor, gate, act }: { sensor: string; gate: string; act: string }) {
  const w = 214;
  const xs = [20, 262, 504, 746];
  const heads = ["THE COLLECTOR READS", "THE PUBLISHER CHECKS", "THE HOST PUBLISHES", "A READER VERIFIES"];
  const texts = [sensor, gate, act, "each line's signature against the committed keyring, the chain back to its genesis, and the state bound to the head line"];
  const max = Math.floor((w - 28) / 6.4);
  const h = 44 + Math.max(...texts.map((t) => lineCount(t, max))) * 16 + 12;
  return (
    <Diagram w={980} h={h + 64} label="From fills to a signed line: the collector reads, the publisher checks, the host publishes, a reader verifies.">
      {xs.map((x, i) => (
        <g key={heads[i]}>
          <Box x={x} y={20} w={w} h={h} rx={12} fill={C.surface} stroke={i === 3 ? C.gate : C.bell} width={1.8} dashed={false} />
          <Tx x={x + 14} y={46} size={11} weight={700} color={i === 3 ? C.gate : C.bell} mono>
            {heads[i]}
          </Tx>
          <TxBlock x={x + 14} y={72} text={texts[i] ?? ""} max={max} size={12.5} lh={16} color={C.ink} />
          {i < 3 ? <Arrow pts={[[x + w + 2, 20 + h / 2], [x + w + 26, 20 + h / 2]]} color={C.ink} width={2} /> : null}
        </g>
      ))}
      <Tx x={20} y={h + 48} size={11.5} color={C.ink2} italic>
        The first three boxes are the register&rsquo;s own words for MONARK Bell. A signature attests origin, not truth; the facts are
        checked by recomputing them.
      </Tx>
    </Diagram>
  );
}

/** Two readings of the close, compared as integers at a fixed scale, before any gap is computed. */
export function CashLegSchema() {
  return (
    <Diagram w={980} h={360} label="Two readings of the close must agree before a gap is computed; a disagreement abstains, never an average.">
      <Box x={20} y={40} w={250} h={70} rx={12} fill={C.lavBg} stroke={C.lav} width={1.6} />
      <Tx x={36} y={68} size={13} weight={700} color={C.ink}>
        The close, first reading
        <Ln x={36} dy={18}>
          <tspan fontSize={11.5} fontWeight={400} fill="var(--ink2)">a consolidated end-of-day source</tspan>
        </Ln>
      </Tx>
      <Box x={20} y={140} w={250} h={70} rx={12} fill={C.lavBg} stroke={C.lav} width={1.6} />
      <Tx x={36} y={168} size={13} weight={700} color={C.ink}>
        The close, second reading
        <Ln x={36} dy={18}>
          <tspan fontSize={11.5} fontWeight={400} fill="var(--ink2)">a second source, cross-read</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[270, 75], [320, 75], [320, 118], [356, 118]]} color={C.ink} width={1.6} />
      <Arrow pts={[[270, 175], [320, 175], [320, 132], [356, 132]]} color={C.ink} width={1.6} />
      <Box x={360} y={90} w={220} h={70} rx={35} fill={C.surface} stroke={C.ink} width={1.8} />
      <Tx x={470} y={120} size={13} weight={700} color={C.ink} anchor="middle">
        the same integer
        <Ln x={470} dy={18}>
          <tspan fontSize={11.5} fontWeight={400}>at a fixed scale?</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[580, 110], [640, 110], [640, 70], [676, 70]]} color={C.commit} width={1.8} />
      <Tx x={600} y={100} size={11} color={C.commit}>
        yes
      </Tx>
      <Box x={680} y={36} w={280} h={70} rx={12} fill={C.surface} stroke={C.commit} width={1.8} />
      <Tx x={696} y={64} size={13} weight={700} color={C.ink}>
        cash_cross matched: a gap
        <Ln x={696} dy={18}>
          <tspan fontFamily="var(--font-mono)" fontSize={12} fontWeight={400}>g = ln( VWAP_share / P_close )</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[580, 140], [640, 140], [640, 170], [676, 170]]} color={C.abstain} width={1.8} />
      <Tx x={600} y={160} size={11} color={C.abstain}>
        no
      </Tx>
      <Box x={680} y={136} w={280} h={70} rx={12} fill={C.soft} stroke={C.abstain} width={1.6} dashed />
      <Tx x={696} y={164} size={13} weight={700} color={C.ink}>
        cash_cross_mismatch
        <Ln x={696} dy={18}>
          <tspan fontSize={11.5} fontWeight={400}>the session abstains, never an average</tspan>
        </Ln>
      </Tx>
      <Box x={20} y={240} w={940} h={96} rx={12} fill={C.surface} stroke={C.rule} />
      <Tx x={36} y={266} size={12.5} color={C.ink}>
        cash_cross_unavailable: the cross-read could not run for that day, stated apart from a mismatch
        <Ln x={36} dy={20}>
          no_close_ref: the close is missing or not positive; no gap is fabricated
        </Ln>
        <Ln x={36} dy={20}>
          The record carries the gap and the on-chain price, never the close itself: a reader brings the close under their own licence.
        </Ln>
      </Tx>
    </Diagram>
  );
}

export interface ChainLine {
  seq: number;
  line_hash: string;
  prev_line_hash: string;
  published_at: string;
  key_id: string;
  state_sha256: string;
}

const short = (hex: string): string => `${hex.slice(0, 10)}…`;

/** The served timeline as a chain: each line names the hash of the one before it, from the genesis value to the latest
 *  line. The lines are the committed facts of the first record and of the head; any line between them is drawn as a gap. */
export function BellChainSchema({ first, head, genesis, lines }: { first: ChainLine; head: ChainLine; genesis: string; lines: number }) {
  const between = lines - 2;
  const nodes = first.seq === head.seq ? [first] : [first, head];
  const bx = [300, 640];
  return (
    <Diagram w={980} h={300} label="The served timeline as a chain: each line names the hash of the line before it, back to the genesis value.">
      <Box x={20} y={60} w={220} h={120} rx={12} fill={C.soft} stroke={C.ink2} width={1.4} dashed />
      <Tx x={36} y={88} size={12} weight={700} color={C.ink2} mono>
        GENESIS
      </Tx>
      <Tx x={36} y={112} size={11} color={C.ink2} mono>
        {short(genesis)}
      </Tx>
      <Tx x={36} y={134} size={11} color={C.ink2}>
        the previous-line hash
        <Ln x={36} dy={15}>
          of the first line
        </Ln>
      </Tx>
      {nodes.map((n, i) => {
        const x = bx[i] ?? 300;
        return (
          <g key={n.seq}>
            <Box x={x} y={40} w={300} h={160} rx={12} fill={C.surface} stroke={C.bell} width={2} />
            <Tx x={x + 16} y={66} size={14} weight={800} color={C.ink}>
              line {n.seq}
            </Tx>
            <Tx x={x + 16} y={90} size={11} color={C.ink2} mono>
              published_at {n.published_at}
              <Ln x={x + 16} dy={17}>
                prev_line_hash {short(n.prev_line_hash)}
              </Ln>
              <Ln x={x + 16} dy={17}>
                state_sha256 {short(n.state_sha256)}
              </Ln>
              <Ln x={x + 16} dy={17}>
                key_id {short(n.key_id)}
              </Ln>
              <Ln x={x + 16} dy={17}>
                sig: Ed25519 over the canonical line
              </Ln>
            </Tx>
            <Tx x={x + 16} y={190} size={11.5} weight={700} color={C.bell} mono>
              line_hash {short(n.line_hash)}
            </Tx>
          </g>
        );
      })}
      <Arrow pts={[[300, 120], [242, 120]]} color={C.ink} width={1.8} />
      {nodes.length > 1 ? <Arrow pts={[[640, 120], [602, 120]]} color={C.ink} width={1.8} /> : null}
      {between > 0 ? (
        <Tx x={620} y={230} size={11.5} color={C.ink2} anchor="middle" italic>
          lines between the first and the latest are elided here
        </Tx>
      ) : null}
      <Tx x={20} y={262} size={12} color={C.ink}>
        Each line carries the hash of the line before it and a signature over its own canonical bytes.
        <Ln x={20} dy={18}>
          A rewrite breaks the chain at recomputation: detectable by whoever keeps an earlier copy, never certified.
        </Ln>
      </Tx>
    </Diagram>
  );
}
