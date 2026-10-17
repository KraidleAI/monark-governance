"use client";

import type { ReactNode } from "react";
import type { AgentStatus, BuildingStatus } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";

// Shared building blocks for the per-agent lateral panels (Shōgen / Hikae / Ukemi). Extracted so the
// three panels do not each redefine the sheet geometry and the block primitive (own-the-code, one place).
//
// Base UI Dialog styled as a LATERAL panel (the onboarding brief calls for a side panel that
// keeps the segment context - not a page, not a centered modal). Appended after the base DialogContent
// classes so twMerge resolves the position conflicts (top/left/translate/max-w/rounded).
export const SHEET =
  "inset-y-0 right-0 left-auto top-0 h-full w-full max-w-md sm:max-w-md translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none data-open:slide-in-from-right-8 data-closed:slide-out-to-right-8";

/** The block primitive the panels share: a heading, its pill, and JSX body (scanned by the honesty lint). */
function Block({ title, pill, children }: { title: string; pill: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t py-4 first:border-t-0 first:pt-2">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-sm font-medium text-foreground">{title}</h3>
        {pill}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

/** One panel block: a heading, its honest build status, and JSX body (scanned by the honesty lint). */
export function PanelBlock({ title, status, children }: { title: string; status: AgentStatus; children: ReactNode }) {
  return <Block title={title} pill={<StatusBadge status={status} className="ml-auto" />}>{children}</Block>;
}

/**
 * The one BUILDING block (Shōgen, How it works): its composition does not run yet and its construction item is open in
 * the piece's register. Its pill says building in its own look (c-pill--building), apart from built and upcoming. PanelBlock keeps
 * AgentStatus, so no PanelBlock can carry building. A test of the /fleet page, rendered with every panel open, reds on a second
 * building text, within the bounds its title names; a first net reds when the text of this name appears in a .ts or .tsx file
 * under app, components or lib anywhere but here and in the Shōgen panel.
 */
export function BuildingPanelBlock({ title, status, children }: { title: string; status: BuildingStatus; children: ReactNode }) {
  return <Block title={title} pill={<span className="c-pill c-pill--building ml-auto">{status}</span>}>{children}</Block>;
}
