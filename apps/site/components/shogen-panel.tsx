"use client";

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
import { ShogenMark } from "@/components/marks/shogen-mark";
import { PanelBlock, SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import { insideFor } from "@/lib/fleet-presentation";
import { SHOGEN_SERVED_SCOPE } from "@/lib/shogen-copy";
import type { FrozenContract } from "@/lib/load-contract";
import type { AgentStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * The built Shōgen agent. Its fleet card carries a panel trigger; so do Hikae, Ukemi and Narabi — each built agent
 * opens the same 8-block template. `contract` is the frozen AttestedPrice shape, read server-side from schemas/;
 * `status` is the card's status READ from the fleet register by the /fleet page (server) and handed in as a prop, so
 * this client panel never hard-codes it and never imports the register. "Honest limits" (a built block) restates the
 * SERVED attest description (a projection of one committed, self-notarized witness; the verifier is not executed at call
 * time), without the venue it names — pinned both ways by the root tests shogen_panel_restates_the_served_attest_limit
 * and registry_notes_track_served_descriptions. "Living proof" stays upcoming and says only what is not shown yet.
 */
export function ShogenPanel({ contract, status }: { contract: FrozenContract; status: AgentStatus }) {
  return (
    <Dialog>
      <AgentCard
        mark={<ShogenMark className="size-8" />}
        name="Shōgen"
        status={status}
        action={<DialogTrigger render={<Button variant="outline" size="sm" />}>Open panel</DialogTrigger>}
      >
        Attested perception &mdash; an attested price testimony.
      </AgentCard>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <DialogTitle>Shōgen</DialogTitle>
          <DialogDescription>Attested perception &mdash; an attested price testimony.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PanelBlock title="How it works" status="built">
            sensor (attest) &rarr; the gate: Hikae and the MONARK budget &rarr; act (execute · upcoming). The gate
            emits commit, defer, or abstain.
          </PanelBlock>
          <PanelBlock title="How it is built" status="built">
            A Rust verifier emits an attested testimony only after its own verdict passes, then projects it
            onto the frozen contract.
          </PanelBlock>
          <WhatInside block={insideFor("shogen")} />
          <PanelBlock title="Honest limits" status="built">
            <p>
              An attested testimony proves what was said, that its bytes hash as recorded, and that the
              attestor signed it.
            </p>
            <p className="mt-2">{SHOGEN_SERVED_SCOPE}</p>
            <p className="mt-2">
              It does not claim the price is true: it keeps no confidence field and carries no price
              number &mdash; the number is read by a downstream Hikae-side adapter &mdash; and the named
              residual hypotheses are exactly what is not verified.
            </p>
            <p className="mt-2">
              The served <code>attest</code> tool projects one committed witness, checked by Shōgen when it was
              captured and self-notarized; the verifier is not executed at call time.
            </p>
          </PanelBlock>
          <PanelBlock title="Living proof" status="upcoming">
            Running tests and coverage become visible once the platform exposes them.
          </PanelBlock>
          <PanelBlock title="Frozen contract" status="built">
            <p>
              {contract.title} &mdash; produced by {contract.producer}. Consumed and emitted as JSON;
              the required fields are:
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
            Reachable now over HTTP and MCP as the <code>attest</code> tool at{" "}
            <code>mcp.monarkgate.tech/mcp</code>. See For integrators for the add one-liners.
          </PanelBlock>
          <PanelBlock title="Traceability" status="upcoming">
            Every figure and decision links to its committed, hashed source in the audit console.
          </PanelBlock>
        </div>
      </DialogContent>
    </Dialog>
  );
}
