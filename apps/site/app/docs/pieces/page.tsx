import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS, builtAgents, upcomingAgents, countWord, capitalized, listNames } from "@/lib/fleet";
import { pieceHref, pieceSlug } from "@/lib/docs-nav";
import { pieceDoc, ROLE_WORDS } from "@/lib/docs-pieces";
import { DocHeader, Toc, DocSection, Figure, StatusPill, PrevNext } from "@/components/docs/doc-kit";
import { FleetMapSchema } from "@/components/docs/schemas/pieces";

// /docs/pieces (server component): every piece of the engine, by role, in the style of its register status, each linked to
// its own page. Names, roles, statuses and counts are read from the fleet register (lib/fleet.ts); the one-line summary of
// each piece is its tagline (lib/docs-pieces.ts). No status is typed on this page.
export const metadata: Metadata = {
  title: "The pieces · Docs · MONARK",
  description: `The pieces of the MONARK engine: ${countWord(FLEET_AGENTS.length)} of them, by role, each with what it reads, how it works and the label the fleet register gives it.`,
};

export default function DocsPiecesPage() {
  const built = builtAgents();
  const upcoming = upcomingAgents();
  const roles = [...new Set(FLEET_AGENTS.map((a) => a.role))];
  const toc = [
    { id: "map", label: "The map" },
    { id: "roles", label: "What each role does" },
    { id: "every", label: "Every piece" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · the pieces" title={`The ${countWord(FLEET_AGENTS.length)} pieces of the engine.`}>
        <p>
          Sensors attest, the gate decides, acts execute on commit, and a door lets other agents in. {capitalized(countWord(built.length))}{" "}
          pieces are served and replayed by integration tests today; {countWord(upcoming.length)} are named on the way, with no metric
          claimed. Each page below says what the piece reads, how it works, what it hands on, and what it does not claim.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="map" title="The map">
        <Figure
          caption={
            <>
              The pieces by role, from the fleet register. A solid chip is a piece the register marks built, a dashed one a piece it
              marks upcoming. The dashed arrow is the path other agents take: through the door to the gate.
            </>
          }
        >
          <FleetMapSchema />
        </Figure>
      </DocSection>

      <DocSection id="roles" title="What each role does">
        <dl className="d-kv">
          {roles.map((r) => (
            <div key={r} style={{ display: "contents" }}>
              <dt>{r}</dt>
              <dd>
                {ROLE_WORDS[r] ?? r}: {listNames(FLEET_AGENTS.filter((a) => a.role === r).map((a) => a.name))}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          A sensor never speaks to an act directly, and an act never moves without a decision: the gate sits between them, and the
          region and the budget decide.
        </p>
      </DocSection>

      <DocSection id="every" title="Every piece">
        <div className="d-cards">
          {FLEET_AGENTS.map((a) => (
            <Link key={a.name} href={pieceHref(a.name)} className={a.status === "built" ? "d-card" : "d-card d-card--up"}>
              <span className="d-card__title">
                {a.name} <StatusPill status={a.status} />
              </span>
              <span className="c-label">{a.role}</span>
              <span className="d-card__body">{capitalized(pieceDoc(pieceSlug(a.name)).tagline)}.</span>
            </Link>
          ))}
        </div>
      </DocSection>

      <PrevNext href="/docs/pieces" />
    </article>
  );
}
