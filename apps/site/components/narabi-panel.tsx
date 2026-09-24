"use client";

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
import { AgentCard } from "@/components/agent-card";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { PanelBlock, SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import { insideFor } from "@/lib/fleet-presentation";
import { NARABI_ROUTE } from "@/lib/narabi-live";
import type { FrozenContract } from "@/lib/load-contract";
import type { AgentStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * The built Narabi sensor (redemption-run velocity). Same 8-block template as Hikae. `contract` is the frozen
 * AttestedFlow shape Narabi emits, read server-side from schemas/; the required fields render via {field}, never
 * hard-coded. `status` is the card's status READ from the fleet register by the /fleet page (server) and handed in as a
 * prop; this client panel never imports the register. "Living proof" is a built block: the daily timeline it points to
 * is served and published on the bare /narabi route (NARABI_ROUTE reused), and a served fact sits only in a built block.
 * No market number, no rendered numeric literal, no frozen-contract field name quoted; the tracker is adaptive, the
 * committed gate region is not.
 */
export function NarabiPanel({ contract, status }: { contract: FrozenContract; status: AgentStatus }) {
  return (
    <Dialog>
      <AgentCard
        mark={<NarabiMark className="size-8" />}
        name="Narabi"
        status={status}
        action={<DialogTrigger render={<Button variant="outline" size="sm" />}>Open panel</DialogTrigger>}
      >
        Redemption-run velocity from the attested onchain flow &mdash; a replayable daily timeline.
      </AgentCard>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <DialogTitle>Narabi</DialogTitle>
          <DialogDescription>
            Redemption-run velocity from the attested onchain flow &mdash; a replayable daily timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PanelBlock title="How it works" status="built">
            Narabi reads the attested redemption flow &mdash; burns, mints and closing supply over a
            declared block window, recomputable onchain &mdash; and steps a quantile tracker on the
            realized outcome each window, publishing the whole timeline.
          </PanelBlock>
          <PanelBlock title="How it is built" status="built">
            An adaptive quantile tracker (Angelopoulos, Barber and Bates decaying step) is stepped on each
            realized outcome; a per-line hash chain makes the timeline replayable; the committed gate
            region stays static until a pre-registered drift criterion fires.
          </PanelBlock>
          <WhatInside block={insideFor("narabi")} />
          <PanelBlock title="Honest limits" status="built">
            <p>
              The tracker adapts; the committed gate region does not &mdash; it holds static until a
              pre-registered drift criterion fires, which opens a review rather than switching anything
              automatically.
            </p>
            <p className="mt-2">
              The timeline is a replayable measurement of realized flow. No coverage is claimed on it, and
              it is never a probability of being right.
            </p>
          </PanelBlock>
          <PanelBlock title="Living proof" status="built">
            The daily timeline is published &mdash;{" "}
            <Link href={NARABI_ROUTE} className="underline underline-offset-4">
              see it on the Narabi page
            </Link>
            . Each step is a committed, replayable line.
          </PanelBlock>
          <PanelBlock title="Frozen contract" status="built">
            <p>
              {contract.title} &mdash; produced by {contract.producer}. Consumed and emitted as JSON; the
              required fields are:
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {contract.required.map((field) => (
                <li key={field}>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{field}</code>
                </li>
              ))}
            </ul>
          </PanelBlock>
          <PanelBlock title="How to connect" status="built">
            Reachable now through the <code>gate</code> tool, under the stable-run velocity class: over MCP at{" "}
            <code>mcp.monarkgate.tech/mcp</code>, and over the plain-HTTP mirror For integrators describes. See
            For integrators for the add one-liners. The Narabi page serves two plain files: the timeline (the
            facts of each daily window and the hash of its AttestedFlow) and the tracker state. The AttestedFlow
            documents themselves are not served; the public sentinel code rebuilds each one from its window&rsquo;s
            facts.
          </PanelBlock>
          <PanelBlock title="Traceability" status="built">
            Every step carries a per-line hash; the published timeline replays to the byte from its
            committed source.
          </PanelBlock>
        </div>
      </DialogContent>
    </Dialog>
  );
}
