// apps/site/app/fleet/agent-pages.ts — where a BUILT agent can be opened on the site, keyed by its register name
// (lib/fleet.ts). Shared by /fleet (register cards) and /roadmap (built list), so both point to the same places. Every
// built agent has its panel on /fleet (section #panels); some also ship a surface of their own. Pure data: no status
// lives here (the status is the register's), and the root test roadmap_built_list_renders_served_notes_and_links_panels_on_fleet
// checks that /fleet renders a panel for every built agent, so the panel link cannot point to nothing. A label never
// says "live" used bare: Narabi publishes on a schedule, so its surface is "the published timeline" (the word the Terms
// recommend, apps/site/data/bell-legal.json), pinned by the same root test file.
import { NARABI_ROUTE } from "@/lib/narabi-live";
import { UKEMI_ROUTE } from "@/lib/ukemi-copy";

export interface AgentLink {
  readonly href: string;
  readonly label: string;
}

/** The anchor of the built panels on /fleet. */
export const PANELS_HREF = "/fleet#panels";

/** A built agent's own surfaces beyond its panel: Narabi ships a daily board, Ukemi a method page and its course report. */
export const AGENT_PAGES: Readonly<Record<string, readonly AgentLink[]>> = {
  Narabi: [{ href: NARABI_ROUTE, label: "see the published timeline →" }],
  Ukemi: [
    { href: UKEMI_ROUTE, label: "page →" },
    { href: `${UKEMI_ROUTE}/course`, label: "calibration course →" },
  ],
};

/** The links of one agent (none when it has no own surface). */
export function agentPages(name: string): readonly AgentLink[] {
  return AGENT_PAGES[name] ?? [];
}
