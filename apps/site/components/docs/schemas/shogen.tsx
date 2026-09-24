// apps/site/components/docs/schemas/shogen.tsx: the schema of the gap the full Shōgen fills. Two feeds that look like two
// sources but share one origin, drawn after the example of the first Chainlink whitepaper (Section 4.1): one source obtains
// its data from another, so an error at the second is always an error at the first. An aggregate that counts feeds counts
// that origin twice; a diversity certificate would write the shared upstream down next to the verdict. An illustration: no
// data, no value, no status.
import { Diagram, Tx, Ln, Box, Arrow, C } from "../svg-kit";

/** Source A copies source B, and both lead back to one upstream; the aggregate counts that one origin as two votes. */
export function CorrelatedSourcesSchema() {
  return (
    <Diagram w={980} h={330} label="Two feeds, one origin: source A copies source B, both lead back to one upstream, and an aggregate counts that origin twice.">
      {/* The upstream. */}
      <Box x={20} y={128} w={180} h={64} rx={10} fill={C.soft} stroke={C.ink2} width={1.4} />
      <Tx x={36} y={154} size={14} weight={700} color={C.ink}>
        One upstream
        <Ln x={36} dy={18}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink2)">where the value starts</tspan>
        </Ln>
      </Tx>
      {/* Source B reads the upstream. */}
      <Box x={270} y={40} w={220} h={64} rx={10} fill={C.surface} stroke={C.ink} width={1.6} />
      <Tx x={286} y={66} size={14} weight={700} color={C.ink}>
        Source B
        <Ln x={286} dy={18}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink2)">reads the upstream</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[200, 150], [236, 150], [236, 72], [266, 72]]} color={C.ink2} width={1.6} />
      {/* Source A copies source B. */}
      <Box x={270} y={216} w={220} h={64} rx={10} fill={C.surface} stroke={C.ink} width={1.6} />
      <Tx x={286} y={242} size={14} weight={700} color={C.ink}>
        Source A
        <Ln x={286} dy={18}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink2)">copies source B, quietly</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[380, 104], [380, 212]]} color={C.abstain} width={1.8} dashed />
      <Tx x={392} y={162} size={11.5} weight={700} color={C.abstain}>
        copies
      </Tx>
      {/* The aggregate counts two feeds. */}
      <Box x={560} y={128} w={190} h={64} rx={10} fill={C.surface} stroke={C.ink} width={1.6} />
      <Tx x={576} y={154} size={14} weight={700} color={C.ink}>
        An aggregate
        <Ln x={576} dy={18}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink2)">counts two feeds</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[490, 72], [524, 72], [524, 150], [556, 150]]} color={C.ink2} width={1.6} />
      <Arrow pts={[[490, 248], [524, 248], [524, 170], [556, 170]]} color={C.ink2} width={1.6} />
      {/* What it counts. */}
      <Box x={790} y={112} w={170} h={96} rx={10} fill={C.soft} stroke={C.abstain} width={1.6} />
      <Tx x={806} y={140} size={14} weight={700} color={C.abstain}>
        Two votes,
        <Ln x={806} dy={18}>
          one origin
        </Ln>
        <Ln x={806} dy={20}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink2)">an error upstream</tspan>
        </Ln>
        <Ln x={806} dy={15}>
          <tspan fontSize={11} fontWeight={400} fill="var(--ink2)">reaches both</tspan>
        </Ln>
      </Tx>
      <Arrow pts={[[750, 160], [786, 160]]} color={C.ink2} width={1.6} />
      {/* What a diversity certificate writes down. */}
      <Tx x={20} y={316} size={12} weight={700} color={C.gate}>
        What a diversity certificate writes down, next to the verdict: the shared upstream, the shared host, the shared failure.
      </Tx>
    </Diagram>
  );
}
