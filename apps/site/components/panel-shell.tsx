"use client";

import type { ReactNode } from "react";
import type { AgentStatus } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";

// Shared building blocks for the per-agent lateral panels (Shōgen / Hikae / Ukemi). Extracted so the
// three panels do not each redefine the sheet geometry and the block primitive (own-the-code, one place).
//
// Base UI Dialog styled as a LATERAL panel (onboarding decision 0d186517 calls for a side panel that
// keeps the segment context - not a page, not a centered modal). Appended after the base DialogContent
// classes so twMerge resolves the position conflicts (top/left/translate/max-w/rounded).
export const SHEET =
  "inset-y-0 right-0 left-auto top-0 h-full w-full max-w-md sm:max-w-md translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none data-open:slide-in-from-right-8 data-closed:slide-out-to-right-8";

/** One panel block: a heading, its honest build status, and JSX body (scanned by the honesty lint). */
export function PanelBlock({ title, status, children }: { title: string; status: AgentStatus; children: ReactNode }) {
  return (
    <section className="border-t py-4 first:border-t-0 first:pt-2">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-sm font-medium text-foreground">{title}</h3>
        <StatusBadge status={status} className="ml-auto" />
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
