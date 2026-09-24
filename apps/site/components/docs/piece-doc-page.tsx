// apps/site/components/docs/piece-doc-page.tsx: the page of one piece of the engine (/docs/pieces/<slug>), a server
// component shared by the eleven piece routes. The piece's name, role and status are read from the fleet register; its
// words from lib/docs-pieces.ts; its contracts from schemas/; what is served today from the register's digit-free served
// note and the committed, hashed served data (each file through its fail-closed loader). An upcoming piece shows no served
// fact: it says named, not delivered.
import Link from "next/link";
import { FLEET_AGENTS, type FleetAgent } from "@/lib/fleet";
import { pieceDoc, ROLE_WORDS } from "@/lib/docs-pieces";
import { pieceSlug, pieceHref } from "@/lib/docs-nav";
import { loadContract } from "@/lib/load-contract";
import { frozenContractsSummary } from "@/app/roadmap/frozen-contracts";
import { loadHarnessServed } from "@/lib/harness-served-load";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { loadNarabiServed } from "@/lib/narabi-served-load";
import { loadNarabiCapture } from "@/lib/narabi-capture-load";
import { captureData } from "@/lib/narabi-live";
import { docsRepoRoot } from "@/lib/docs-references-load";
import { PiecePlate } from "./schemas/pieces";
import { DocHeader, StatusPill, Toc, DocSection, Figure, Callout, RefList } from "./doc-kit";

const STATE_WORDS: Readonly<Record<string, string>> = {
  synthetic: "synthetic fixture",
  none: "no calibration committed",
  committed: "committed",
};

function agentBySlug(slug: string): FleetAgent {
  const a = FLEET_AGENTS.find((x) => pieceSlug(x.name) === slug);
  if (a === undefined) throw new Error(`docs piece page: no register agent for '${slug}'`);
  return a;
}

/** What the served files say today for a built piece (never called for an upcoming one). */
function ServedDetail({ slug, root }: { slug: string; root: string }) {
  if (slug === "shogen") {
    const att = loadHarnessServed(root).attest;
    return (
      <p>
        The served <code>attest</code> tool returns one committed witness, labelled as served: <em>{att.label}</em>. Its named
        residual hypotheses: {att.hypotheses.join(", ")}. The channel it was recorded over: <code>{att.channel}</code>.
      </p>
    );
  }
  if (slug === "hikae") {
    const served = loadHarnessServed(root);
    return (
      <>
        <p>The task classes the served gate knows, with the clauses it serves for each, as read from the served harness:</p>
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">task class</th>
                <th className="c-label">calibration</th>
                <th className="c-label">served clauses</th>
              </tr>
            </thead>
            <tbody>
              {served.classes.map((c) => (
                <tr key={c.class_id}>
                  <td className="c-mono">{c.class_id}</td>
                  <td>{STATE_WORDS[c.state] ?? c.state}</td>
                  <td>{c.clauses.join("; ")}.</td>
                </tr>
              ))}
              <tr>
                <td className="c-mono">your own class</td>
                <td>your calibration</td>
                <td>{served.byo_clause}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  }
  if (slug === "ukemi") {
    const s = loadUkemiServed(root);
    return (
      <p>
        The served state of the class <code>{s.served_class}</code>, copied from the served gate description at {s.read_at}:{" "}
        <em>{s.liq_clause}</em>.
      </p>
    );
  }
  if (slug === "narabi") {
    const served = loadNarabiServed(root);
    const data = captureData(loadNarabiCapture(root));
    const last = data.lines[data.lines.length - 1];
    return (
      <p>
        The served gate class <code>{served.gate.task_class}</code>, keyed to the population <code>{served.gate.predictor_id}</code>. The
        sentinel publishes at the UTC slots {served.sentinel_timer.on_calendar_utc.join(", ")}.
        {last !== undefined ? (
          <>
            {" "}
            In the committed capture of the published files, the last window is the day {last.day}, and the tracker has stepped{" "}
            {data.state.tracker.t} times.
          </>
        ) : null}
      </p>
    );
  }
  return null;
}

export function PieceDocPage({ slug }: { slug: string }) {
  const root = docsRepoRoot();
  const a = agentBySlug(slug);
  const doc = pieceDoc(slug);
  const unserved = new Set(frozenContractsSummary(root).unservedTitles);
  const contracts = doc.contracts.map((file) => loadContract(root, file, a.name));
  const idx = FLEET_AGENTS.findIndex((x) => x.name === a.name);
  const prev = FLEET_AGENTS[idx - 1];
  const next = FLEET_AGENTS[idx + 1];
  const role = ROLE_WORDS[a.role] ?? a.role;
  const toc = [
    { id: "picture", label: "In one picture" },
    { id: "today", label: a.status === "built" ? "What is served today" : "What exists today" },
    ...(contracts.length > 0 ? [{ id: "contracts", label: "Contracts" }] : []),
    { id: "not", label: "What it does not claim" },
    { id: "sources", label: "Sources" },
    { id: "further", label: "Go further" },
  ];
  return (
    <article>
      <DocHeader eyebrow={`docs · the pieces · ${a.role}`} title={a.name} pill={<StatusPill status={a.status} />}>
        <p>{doc.summary}</p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="picture" title="In one picture">
        <Figure
          caption={
            <>
              {a.name} {role}: what it reads, how it works, what it hands on. The boxes are drawn in the style of the register status;
              the words come from this page&rsquo;s data and the contract titles from the frozen schemas.
            </>
          }
        >
          <PiecePlate name={a.name} role={a.role} status={a.status} doc={doc} contractTitles={contracts.map((c) => c.title)} />
        </Figure>
      </DocSection>

      <DocSection id="today" title={a.status === "built" ? "What is served today" : "What exists today"}>
        {a.status === "built" ? (
          <>
            <p>
              The register&rsquo;s served note for {a.name}: <em>{a.wiring.note}</em>.
            </p>
            <ServedDetail slug={slug} root={root} />
          </>
        ) : (
          <Callout tone="today" title="Named, not delivered">
            <p>
              The register lists {a.name} as {a.status}: no code is served for it, and no metric is claimed. The plate above says
              what it would read and do; it becomes built only with a served path and an integration test that replays it.
            </p>
          </Callout>
        )}
      </DocSection>

      {contracts.length > 0 ? (
        <DocSection id="contracts" title="Contracts">
          <p>
            The frozen contracts {a.name} reads or writes, each with the keys it requires, read from the schema files. A contract with
            closed keys refuses an unknown key instead of ignoring it.
          </p>
          <dl className="d-kv">
            {contracts.map((c) => (
              <div key={c.title} style={{ display: "contents" }}>
                <dt>
                  {c.title}
                  {unserved.has(c.title) ? " · frozen, not served yet" : ""}
                </dt>
                <dd className="c-mono">{c.required.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </DocSection>
      ) : null}

      <DocSection id="not" title="What it does not claim">
        <Callout tone="limit" title="Does not claim">
          <p>{doc.notClaim}</p>
        </Callout>
      </DocSection>

      <DocSection id="sources" title="Sources">
        <RefList refIds={doc.refs} />
      </DocSection>

      <DocSection id="further" title="Go further">
        <ul className="d-bullets">
          {doc.more.map((m) => (
            <li key={m.href}>
              <Link href={m.href}>{m.label}</Link>
            </li>
          ))}
        </ul>
      </DocSection>

      <nav className="d-prevnext" aria-label="Previous and next piece">
        {prev ? (
          <Link href={pieceHref(prev.name)} className="d-prevnext__link">
            <span className="c-label">previous piece</span>
            <span>{prev.name}</span>
          </Link>
        ) : (
          <Link href="/docs/pieces" className="d-prevnext__link">
            <span className="c-label">back to</span>
            <span>Every piece</span>
          </Link>
        )}
        {next ? (
          <Link href={pieceHref(next.name)} className="d-prevnext__link d-prevnext__link--next">
            <span className="c-label">next piece</span>
            <span>{next.name}</span>
          </Link>
        ) : (
          <Link href="/docs/bell" className="d-prevnext__link d-prevnext__link--next">
            <span className="c-label">next</span>
            <span>MONARK Bell</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
