"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import type { InsideBlock } from "@/lib/fleet-presentation";
import type { AgentStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * A light, data-driven placeholder panel for an UPCOMING fleet entity that has no built engine to show:
 * the eight roadmap agents (on /fleet) and the three VISAGE artefacts (on /products). ONE component
 * instead of eleven (F-site-6 R-25): a dashed card that opens the same lateral sheet as the built
 * panels, carrying the honest one-line descriptor, an optional "Sold to" line (visage buyers), and the
 * Mod #1 "What it will use" block. `status` flows from the register (never hard-coded here). Openable
 * upcoming cards are a documented Mod #1 delta from the design's non-openable divs (docs/G1-lot-fsite-6.md).
 */
export function PlaceholderPanel({
  mark,
  name,
  sub,
  line,
  soldTo,
  inside,
  status,
}: {
  mark?: ReactNode;
  /** kanji is intentionally omitted (app precedent: /roadmap and the built cards carry none). */
  name: string;
  /** the tagline for a visage (The File / The Seal / The Trigger); absent for an agent. */
  sub?: string;
  /** the sourced one-line descriptor (fleet.ts agent line, or the visage `what`). */
  line: string;
  /** the named buyer, for a visage only. */
  soldTo?: string;
  inside: InsideBlock;
  status: AgentStatus;
}) {
  return (
    <Dialog>
      <article className="flex h-full flex-col gap-3 rounded-xl border border-dashed bg-card p-5">
        <div className="flex items-center gap-3">
          {mark ? <span className="text-primary">{mark}</span> : null}
          <h3 className="font-heading text-base font-medium text-card-foreground">{name}</h3>
          {sub ? <span className="font-serif text-sm italic text-muted-foreground">{sub}</span> : null}
          <StatusBadge status={status} className="ml-auto" />
        </div>
        <p className="text-sm text-muted-foreground">{line}</p>
        <div className="mt-auto pt-1">
          <DialogTrigger render={<Button variant="outline" size="sm" />}>See {name}</DialogTrigger>
        </div>
      </article>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2">
            <DialogTitle>{name}</DialogTitle>
            {sub ? <span className="font-serif text-sm italic text-muted-foreground">{sub}</span> : null}
            <StatusBadge status={status} className="ml-auto" />
          </div>
          <DialogDescription>{line}</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {soldTo ? (
            <section className="border-t py-4 first:border-t-0 first:pt-2">
              <h3 className="font-heading text-sm font-medium text-foreground">Sold to</h3>
              <p className="mt-2 text-sm text-muted-foreground">{soldTo}</p>
            </section>
          ) : null}
          <WhatInside block={inside} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
