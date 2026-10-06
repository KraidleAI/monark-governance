// apps/site/components/docs/schemas/glossary.tsx: the map of the glossary's main words, as they connect in one decision. The
// words are typed here as JSX text (scanned by the honesty lint); the frozen contract titles are read from schemas/ by the page.
import { Diagram, Tx, Box, Arrow, C } from "../svg-kit";

function Node({ x, y, w, children, tone = C.ink }: { x: number; y: number; w: number; children: string; tone?: string }) {
  return (
    <g>
      <Box x={x} y={y} w={w} h={40} rx={20} fill={C.surface} stroke={tone} width={1.8} />
      <Tx x={x + w / 2} y={y + 25} size={13} weight={700} color={C.ink} anchor="middle">
        {children}
      </Tx>
    </g>
  );
}

/** The main words of the glossary, placed where they act in one decision. */
export function ConceptMapSchema({ predictionTitle, verdictTitle, decisionTitle }: { predictionTitle: string; verdictTitle: string; decisionTitle: string }) {
  return (
    <Diagram w={980} h={420} label="The words of the engine, where they act in one decision.">
      <Node x={20} y={40} w={180} tone={C.narabi}>
        testimony
      </Node>
      <Node x={20} y={120} w={180} tone={C.narabi}>
        residual hypothesis
      </Node>
      <Node x={250} y={40} w={200} tone={C.gate}>
        {predictionTitle}
      </Node>
      <Node x={250} y={120} w={200}>
        task class
      </Node>
      <Node x={250} y={200} w={200}>
        calibration scores
      </Node>
      <Node x={500} y={200} w={200} tone={C.gate}>
        q-hat, the margin
      </Node>
      <Node x={500} y={120} w={200} tone={C.gate}>
        region
      </Node>
      <Node x={500} y={40} w={200} tone={C.gate}>
        {verdictTitle}
      </Node>
      <Node x={750} y={40} w={210} tone={C.monark}>
        {decisionTitle}
      </Node>
      <Node x={750} y={120} w={210} tone={C.monark}>
        budget B_t
      </Node>
      <Node x={750} y={200} w={210}>
        reason code
      </Node>
      <Node x={250} y={300} w={200}>
        exchangeability
      </Node>
      <Node x={500} y={300} w={200}>
        coverage
      </Node>
      <Node x={750} y={300} w={210}>
        commit, defer, abstain
      </Node>
      <Arrow pts={[[200, 60], [248, 60]]} color={C.ink2} />
      <Arrow pts={[[200, 140], [248, 60]]} color={C.ink2} dashed />
      <Arrow pts={[[350, 240], [350, 298]]} color={C.ink2} dashed />
      <Arrow pts={[[450, 220], [498, 220]]} color={C.ink2} />
      <Arrow pts={[[600, 200], [600, 162]]} color={C.ink2} />
      <Arrow pts={[[600, 120], [600, 82]]} color={C.ink2} />
      <Arrow pts={[[450, 60], [498, 60]]} color={C.ink2} />
      <Arrow pts={[[700, 60], [748, 60]]} color={C.ink2} />
      <Arrow pts={[[855, 120], [855, 82]]} color={C.ink2} />
      <Arrow pts={[[750, 220], [728, 220], [728, 72], [748, 72]]} color={C.ink2} dashed />
      <Arrow pts={[[450, 320], [498, 320]]} color={C.ink2} dashed />
      <Arrow pts={[[600, 300], [600, 242]]} color={C.ink2} dashed />
      <Arrow pts={[[960, 60], [972, 60], [972, 320], [962, 320]]} color={C.monark} width={1.2} dashed />
      <Tx x={20} y={380} size={12} color={C.ink2}>
        Solid arrows: what a decision is made of. Dashed arrows: what a word rests on or carries along.
      </Tx>
      <Tx x={20} y={400} size={12} color={C.ink2}>
        Every word on this map has its entry below.
      </Tx>
    </Diagram>
  );
}
