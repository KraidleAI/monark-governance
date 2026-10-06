// apps/site/components/docs/schemas/gate.tsx: the schemas of the gate page. One decision end to end (adapted from the pitch
// deck's airlock plate), the closed policy as questions in their declared order (packages/hikae/src/l3-gate.ts), how a
// region is built from sorted calibration scores (an illustration: no data, no value), the three strands of an attested
// conformal decision (adapted from the deck's decomposition plate, with the budget as it is served: carried by the caller
// and returned unchanged), and the loop of the budget. The action words and the reason codes are read from the frozen enum
// by the page and passed in; the chambers and the questions come from lib/docs-gate.ts.
import { CHAMBERS, REASON_DOCS, POLICY_STEPS, DOCS_ACTION_COMMIT, DOCS_ACTION_DEFER, DOCS_ACTION_ABSTAIN, type Chamber } from "@/lib/docs-gate";
import { Diagram, Tx, Ln, Box, Arrow, Dot, Rule, TxBlock, lineCount, C } from "../svg-kit";

function codesOf(reasons: readonly string[], chamber: Chamber, tone: number): string[] {
  return reasons.filter((r) => REASON_DOCS[r]?.chamber === chamber && REASON_DOCS[r]?.tone === tone);
}

/** One decision, end to end: each chamber keeps what it refuses, with its reason code; commits run to the act. */
export function DecisionPathSchema({ actions, reasons }: { actions: readonly string[]; reasons: readonly string[] }) {
  const xs = [30, 270, 510, 750];
  const ys = [70, 110, 150, 190];
  const commit = actions[DOCS_ACTION_COMMIT] ?? "";
  const defer = actions[DOCS_ACTION_DEFER] ?? "";
  const abstain = actions[DOCS_ACTION_ABSTAIN] ?? "";
  const deferCodes = codesOf(reasons, "gate", DOCS_ACTION_DEFER);
  const commitCodes = codesOf(reasons, "act", DOCS_ACTION_COMMIT);
  return (
    <Diagram w={980} h={480} label="One decision, end to end: read the input, calibrate, decide, act. Each stage keeps what it refuses, with its reason code.">
      {CHAMBERS.map((ch, i) => {
        const x = xs[i] ?? 30;
        const y = ys[i] ?? 70;
        const refused = codesOf(reasons, ch.key, DOCS_ACTION_ABSTAIN);
        return (
          <g key={ch.key}>
            <Box x={x} y={y} w={210} h={124} rx={12} fill={C.surface} stroke={C.ink} width={1.8} />
            <Tx x={x + 14} y={y + 28} size={15} weight={800} color={C.ink}>
              {ch.title}
            </Tx>
            <TxBlock x={x + 14} y={y + 52} text={ch.blurb} max={30} size={12} lh={15} color={C.ink2} />
            {i < CHAMBERS.length - 1 ? <Arrow pts={[[x + 210, y + 62], [x + 225, y + 62], [x + 225, (ys[i + 1] ?? y) + 40], [x + 240, (ys[i + 1] ?? y) + 40]]} color={C.ink2} width={1.6} /> : null}
            {refused.length > 0 ? (
              <g>
                <Rule x1={x + 22} y1={y + 124} x2={x + 22} y2={380} color={C.abstain} width={1.6} />
                <Tx x={x + 30} y={y + 146} size={11} weight={700} color={C.abstain} mono>
                  {abstain}
                </Tx>
                {refused.map((code, j) => (
                  <Tx key={code} x={x + 30} y={y + 164 + j * 15} size={11} color={C.abstain} mono>
                    {code}
                  </Tx>
                ))}
              </g>
            ) : null}
          </g>
        );
      })}
      {/* The defer branch: the decision waits while its window is open; the budget is untouched. */}
      <Box x={720} y={20} w={240} h={40} rx={10} fill={C.deferBg} stroke={C.defer} width={1.6} dashed />
      <Tx x={732} y={36} size={12} weight={700} color={C.defer} mono>
        {defer}
      </Tx>
      <Tx x={732} y={52} size={11} color={C.defer} mono>
        {deferCodes.join(" · ")}
      </Tx>
      <Arrow pts={[[690, 150], [690, 40], [716, 40]]} color={C.defer} width={1.6} />
      {/* The clear thread: commits run to the act and are kept too. */}
      <Arrow pts={[[960, 250], [966, 250], [966, 407], [958, 407]]} color={C.commit} width={2} />
      <Tx x={900} y={330} size={12} weight={700} color={C.commit} mono anchor="end">
        {commit} · {commitCodes.join(" · ")}
      </Tx>
      <Box x={30} y={384} w={700} h={46} rx={10} fill={C.soft} stroke={C.abstain} width={1.6} />
      <Tx x={46} y={412} size={13} weight={600} color={C.ink}>
        Kept: each stage keeps what it refuses, with its reason code.
      </Tx>
      <Box x={742} y={384} w={216} h={46} rx={10} fill={C.soft} stroke={C.commit} width={1.6} />
      <Tx x={756} y={412} size={13} weight={600} color={C.ink}>
        Kept too: the commits.
      </Tx>
      <Tx x={490} y={464} size={14} weight={700} color={C.ink} anchor="middle">
        Both threads are kept. Both are replayable and auditable.
      </Tx>
    </Diagram>
  );
}

/** The closed policy as questions, in their declared order of priority. A No ends the decision with its codes. */
export function PolicySchema({ actions, reasons }: { actions: readonly string[]; reasons: readonly string[] }) {
  const commit = actions[DOCS_ACTION_COMMIT] ?? "";
  const deferWord = actions[DOCS_ACTION_DEFER] ?? "";
  const abstainWord = actions[DOCS_ACTION_ABSTAIN] ?? "";
  const known = new Set(reasons);
  const toned = (codes: readonly string[], tone: number): string => codes.filter((c) => REASON_DOCS[c]?.tone === tone).join(", ");
  const rowH = 74;
  const h = 70 + POLICY_STEPS.length * rowH + 60;
  return (
    <Diagram w={980} h={h} label="The closed policy: questions in a fixed order; the first No ends the decision with its reason codes.">
      <Tx x={40} y={36} size={12} color={C.ink2} mono>
        a reading and the caller&rsquo;s terms enter at the top
      </Tx>
      {POLICY_STEPS.map((st, i) => {
        const y = 56 + i * rowH;
        const codes = st.onNo.filter((c) => known.has(c));
        const last = i === POLICY_STEPS.length - 1;
        const qLines = lineCount(st.question, 66);
        return (
          <g key={st.question}>
            <Box x={40} y={y} w={520} h={48} rx={24} fill={C.surface} stroke={C.ink} width={1.6} />
            <TxBlock x={62} y={y + 29 - (qLines - 1) * 8} text={st.question} max={66} size={13} lh={16} weight={600} color={C.ink} />
            <Arrow pts={[[560, y + 24], [640, y + 24]]} color={C.abstain} width={1.6} />
            <Tx x={600} y={y + 18} size={11} color={C.abstain} anchor="middle">
              no
            </Tx>
            {last ? (
              <g>
                <Box x={644} y={y - 6} w={316} h={60} rx={8} fill={C.deferBg} stroke={C.defer} width={1.4} dashed />
                <Tx x={656} y={y + 12} size={11} color={C.defer} mono>
                  {deferWord} while the window is open:
                  <Ln x={656} dy={15}>
                    {toned(codes, DOCS_ACTION_DEFER)}
                  </Ln>
                  <Ln x={656} dy={15}>
                    {abstainWord} once it closes: {toned(codes, DOCS_ACTION_ABSTAIN)}
                  </Ln>
                </Tx>
              </g>
            ) : (
              <g>
                <Box x={644} y={y + 2} w={316} h={44} rx={8} fill={C.soft} stroke={C.abstain} width={1.4} />
                <Tx x={656} y={y + 28} size={11.5} color={C.abstain} mono>
                  {abstainWord}: {codes.join(", ")}
                </Tx>
              </g>
            )}
            <Arrow pts={[[300, y + 48], [300, y + rowH - 1]]} color={C.commit} width={1.6} />
            <Tx x={310} y={y + 64} size={11} color={C.commit}>
              yes
            </Tx>
          </g>
        );
      })}
      <Box x={200} y={56 + POLICY_STEPS.length * rowH + 8} w={200} h={40} rx={20} fill={C.surface} stroke={C.commit} width={2} />
      <Tx x={300} y={56 + POLICY_STEPS.length * rowH + 33} size={14} weight={700} color={C.commit} anchor="middle" mono>
        {commit} · covered
      </Tx>
      <Tx x={960} y={h - 14} size={11.5} color={C.ink2} anchor="end" italic>
        Profit and loss never enter the policy.
      </Tx>
    </Diagram>
  );
}

/** How a region is built: calibration scores sorted on a line, the margin at a rank fixed by the target, and every answer
 *  whose score is at most that margin kept in the region. An illustration of the method: no data, no value. */
export function QuantileSchema() {
  const dots = [70, 110, 138, 170, 196, 230, 262, 300, 334, 372, 410, 452, 500, 560, 640, 760];
  const qx = 560;
  return (
    <Diagram w={980} h={330} label="How a region is built: sorted calibration scores, a margin at a rank fixed by the target, and the answers scored under it.">
      <Tx x={40} y={34} size={13} weight={700} color={C.ink}>
        Calibration: how wrong the model was, on points it did not see
      </Tx>
      <Rule x1={50} y1={96} x2={900} y2={96} color={C.ink2} width={1.4} />
      {dots.map((d) => (
        <Dot key={d} cx={d} cy={96} r={6} color={d <= qx ? C.gate : C.ink2} />
      ))}
      <Tx x={50} y={124} size={11} color={C.ink2}>
        small score: the model was close
      </Tx>
      <Tx x={900} y={124} size={11} color={C.ink2} anchor="end">
        large score: the model was far off
      </Tx>
      <Rule x1={qx} y1={62} x2={qx} y2={140} color={C.monark} width={2.4} />
      <Tx x={qx} y={56} size={13} weight={700} color={C.monark} anchor="middle">
        q-hat
      </Tx>
      <Tx x={qx + 10} y={156} size={11.5} color={C.monark}>
        the score at the rank fixed by the target coverage
      </Tx>
      <Tx x={40} y={206} size={13} weight={700} color={C.ink}>
        A new reading: every answer whose score is at most q-hat is kept
      </Tx>
      {[
        { x: 70, keep: true },
        { x: 230, keep: true },
        { x: 390, keep: true },
        { x: 550, keep: false },
        { x: 710, keep: false },
      ].map((cand, i) => (
        <g key={cand.x}>
          <Box x={cand.x} y={226} w={140} h={40} rx={8} fill={cand.keep ? C.surface : "none"} stroke={cand.keep ? C.gate : C.ink2} width={cand.keep ? 2 : 1.2} dashed={!cand.keep} />
          <Tx x={cand.x + 70} y={251} size={12} color={cand.keep ? C.ink : C.ink2} anchor="middle">
            {cand.keep ? (i === 0 ? "answer kept" : "kept") : "left out"}
          </Tx>
        </g>
      ))}
      <Tx x={40} y={302} size={12} color={C.ink2}>
        The kept answers form the region. One answer kept: small enough to act on. Every answer kept: too large, wait.
      </Tx>
      <Tx x={940} y={322} size={11} color={C.ink2} anchor="end" italic>
        An illustration of the method. No data, no value.
      </Tx>
    </Diagram>
  );
}

/** Three strands, one decision: the attestation rides along, the conformal region decides, the budget is carried by the
 *  caller and returned unchanged. The decision's keys are read from the frozen schema by the page. */
export function StrandsSchema({ decisionTitle, decisionKeys }: { decisionTitle: string; decisionKeys: readonly string[] }) {
  return (
    <Diagram w={980} h={470} label="Three strands, one decision: the attestation rides along, the conformal region decides, the budget is carried by the caller.">
      {/* (a) Attestation */}
      <Box x={30} y={30} w={640} h={120} rx={12} fill={C.surface} stroke={C.narabi} width={2} />
      <Tx x={50} y={60} size={16} weight={800} color={C.ink}>
        Attestation
      </Tx>
      <Tx x={190} y={60} size={12} weight={700} color={C.narabi}>
        optional on the served path
      </Tx>
      {["bytes", "hash", "named residual hypotheses"].map((w, i) => (
        <g key={w}>
          <Box x={50 + i * 150} y={78} w={i === 2 ? 230 : 120} h={30} rx={15} fill={C.soft} stroke={C.rule} />
          <Tx x={50 + i * 150 + (i === 2 ? 115 : 60)} y={98} size={12} color={C.ink} anchor="middle">
            {w}
          </Tx>
          {i < 2 ? <Arrow pts={[[172 + i * 150, 93], [198 + i * 150, 93]]} color={C.ink2} width={1.4} /> : null}
        </g>
      ))}
      <Tx x={50} y={136} size={12} weight={600} color={C.ink} italic>
        Origin and bytes, never truth.
      </Tx>
      {/* (b) Conformal */}
      <Box x={30} y={170} w={640} h={120} rx={12} fill={C.surface} stroke={C.gate} width={2.4} />
      <Tx x={50} y={200} size={16} weight={800} color={C.ink}>
        Conformal
      </Tx>
      <Tx x={190} y={200} size={12} weight={700} color={C.gate}>
        the decision driver
      </Tx>
      {["nonconformity scores", "quantile", "region at the target coverage"].map((w, i) => (
        <g key={w}>
          <Box x={50 + i * 190} y={218} w={i === 2 ? 220 : 170} h={30} rx={15} fill={C.soft} stroke={C.rule} />
          <Tx x={50 + i * 190 + (i === 2 ? 110 : 85)} y={238} size={12} color={C.ink} anchor="middle">
            {w}
          </Tx>
          {i < 2 ? <Arrow pts={[[222 + i * 190, 233], [238 + i * 190, 233]]} color={C.ink2} width={1.4} /> : null}
        </g>
      ))}
      <Tx x={50} y={276} size={12} weight={600} color={C.ink} italic>
        A region, never a probability.
      </Tx>
      {/* (c) Budget */}
      <Box x={30} y={310} w={640} h={120} rx={12} fill={C.surface} stroke={C.monark} width={2} />
      <Tx x={50} y={340} size={16} weight={800} color={C.ink}>
        Budget B_t
      </Tx>
      <Tx x={190} y={340} size={12} weight={700} color={C.monark}>
        carried by the caller
      </Tx>
      {["the caller keeps B_t", "sends it with each call", "returned unchanged"].map((w, i) => (
        <g key={w}>
          <Box x={50 + i * 200} y={358} w={180} h={30} rx={15} fill={C.soft} stroke={C.rule} />
          <Tx x={50 + i * 200 + 90} y={378} size={12} color={C.ink} anchor="middle">
            {w}
          </Tx>
          {i < 2 ? <Arrow pts={[[232 + i * 200, 373], [248 + i * 200, 373]]} color={C.ink2} width={1.4} /> : null}
        </g>
      ))}
      <Tx x={50} y={416} size={12} weight={600} color={C.ink} italic>
        A right to act, metered. Below the caller&rsquo;s floor, the gate abstains.
      </Tx>
      {/* The decision */}
      <Arrow pts={[[670, 90], [700, 90], [700, 200], [728, 200]]} color={C.narabi} width={1.6} dashed />
      <Arrow pts={[[670, 230], [728, 230]]} color={C.gate} width={2.4} />
      <Arrow pts={[[670, 370], [700, 370], [700, 260], [728, 260]]} color={C.monark} width={1.6} />
      <rect x={732} y={130} width={226} height={250} rx={14} fill={C.ink} />
      <Tx x={750} y={160} size={15} weight={800} color={C.bg}>
        {decisionTitle}
      </Tx>
      {decisionKeys.map((k, i) => (
        <Tx key={k} x={750} y={186 + i * 19} size={12} color={C.bg} mono>
          {k}
        </Tx>
      ))}
      <Tx x={750} y={368} size={11} color={C.bg} italic>
        no score field, anywhere
      </Tx>
      <Tx x={960} y={456} size={12} color={C.ink2} anchor="end">
        A testimony&rsquo;s residual joins the verdict only on a class with a committed subject; no served class has one.
      </Tx>
    </Diagram>
  );
}
