"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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
 * A light, data-driven placeholder panel for a fleet entity that has no bespoke engine panel to show:
 * the seven roadmap agents (on /fleet), the three VISAGE artefacts (on /products), and the register-driven
 * BUILT sentinel Narabi (its "What's inside" block is chosen by `WhatInside` on `block.kind`). ONE component
 * instead of eleven: a dashed card that opens the same lateral sheet as the built
 * panels, carrying the honest one-line descriptor, an optional "Sold to" line (visage buyers), and the
 * Mod #1 "What it will use" block. `status` flows from the register (never hard-coded here). Openable
 * upcoming cards are a documented Mod #1 delta from the design's non-openable divs.
 */
export function PlaceholderPanel({
  mark,
  name,
  sub,
  line,
  soldTo,
  inside,
  status,
  liveHref,
  liveLabel,
  wide = false,
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
  /** an optional route to the agent's own live surface (Narabi -> /narabi); register-keyed by the caller. */
  liveHref?: string;
  liveLabel?: string;
  /** restyle B (/fleet): a full-width horizontal card with the facts well shown inline (the built Narabi
   *  sensor). Default false = the narrow dashed card used by the roadmap agents and the products. */
  wide?: boolean;
}) {
  const built = status === "built";
  const trigger = <DialogTrigger render={<Button variant="outline" size="sm" />}>See {name}</DialogTrigger>;
  const live = liveHref ? (
    <Link href={liveHref} className="text-sm text-monark-t underline">
      {liveLabel ?? "See it live"}
    </Link>
  ) : null;
  return (
    <Dialog>
      {wide ? (
        // Full-width horizontal card for the built Narabi sensor (design L63-67): mark + line, the facts
        // well inline, and the two links. Same strings as the narrow card; solid (non-dashed) border.
        <article className="grid gap-5 rounded-xl border bg-card p-6 shadow-sm min-[900px]:grid-cols-[1.2fr_1fr_auto] min-[900px]:items-center min-[900px]:gap-6">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              {mark ? <span className="text-primary">{mark}</span> : null}
              <h3 className="font-heading text-lg font-medium text-card-foreground">{name}</h3>
              {sub ? <span className="font-serif text-sm italic text-muted-foreground">{sub}</span> : null}
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-muted-foreground">{line}</p>
          </div>
          <WhatInside block={inside} variant="well" />
          <div className="flex flex-col gap-2">
            {live}
            {trigger}
          </div>
        </article>
      ) : (
        <article className={cn("flex h-full flex-col gap-3 rounded-xl border bg-card p-5", !built && "border-dashed")}>
          <div className="flex items-center gap-3">
            {mark ? <span className="text-primary">{mark}</span> : null}
            <h3 className="font-heading text-base font-medium text-card-foreground">{name}</h3>
            {sub ? <span className="font-serif text-sm italic text-muted-foreground">{sub}</span> : null}
            <StatusBadge status={status} className="ml-auto" />
          </div>
          <p className="text-sm text-muted-foreground">{line}</p>
          <div className="mt-auto flex items-center gap-3 pt-1">
            {trigger}
            {live}
          </div>
        </article>
      )}

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
          {liveHref ? (
            <section className="border-t py-4">
              <Link href={liveHref} className="text-sm text-monark-t underline">
                {liveLabel ?? "See it live"}
              </Link>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
