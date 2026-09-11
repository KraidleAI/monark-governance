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
import { UkemiMark } from "@/components/marks/ukemi-mark";
import { PanelBlock, SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import { insideFor } from "@/lib/fleet-presentation";
import type { FrozenContract } from "@/lib/load-contract";
import { cn } from "@/lib/utils";

/**
 * The built Ukemi agent (liquidation-cascade survival). Same 8-block template as Shōgen: blocks 1/2/4/6
 * BUILT, blocks 3/5/7/8 UPCOMING. `contract` is the frozen Prediction shape Ukemi emits for the gate,
 * read server-side from schemas/. Block 4 is the C8 honest limit: uniqueness is lost
 * when the recovery rates fall below full recovery — grounded in packages/ukemi/README.md ("Uniqueness
 * LOST once α < 1 or β < 1 ... we never claim uniqueness outside α = β = 1"). No market number is rendered.
 */
export function UkemiPanel({ contract }: { contract: FrozenContract }) {
  return (
    <Dialog>
      <AgentCard
        mark={<UkemiMark className="size-8" />}
        name="Ukemi"
        status="built"
        action={<DialogTrigger render={<Button variant="outline" size="sm" />}>Open panel</DialogTrigger>}
      >
        Liquidation-cascade survival.
      </AgentCard>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <DialogTitle>Ukemi</DialogTitle>
          <DialogDescription>Liquidation-cascade survival.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PanelBlock title="How it works" status="built">
            Ukemi computes, in a way anyone can recompute, how much of a position or a pool is liquidable
            under a shock, and emits that as a numeric prediction for the gate to conform into an interval
            &mdash; so a cascade can be read before it clears.
          </PanelBlock>
          <PanelBlock title="How it is built" status="built">
            A network clearing fixed point &mdash; each node pays what it can, in rounds &mdash; measures
            how a local shock is amplified across the payment network, using recovery rates &alpha; and
            &beta; for external and interbank assets in liquidation.
          </PanelBlock>
          <WhatInside block={insideFor("ukemi")} />
          <PanelBlock title="Honest limits" status="built">
            <p>
              Ukemi solves for a clearing outcome, and that outcome is unique only under full recovery.
              Once the recovery rate &alpha; or &beta; falls below one &mdash; partial recovery in
              liquidation &mdash; uniqueness is lost: several clearing outcomes fit the same inputs.
            </p>
            <p className="mt-2">
              So Ukemi reports both the largest and the smallest clearing outcome rather than name one,
              and it never claims uniqueness outside full recovery. It reports a region under a declared
              shock &mdash; never a yield, never one promised survival &mdash; and it does not trade and
              calls no order.
            </p>
          </PanelBlock>
          <PanelBlock title="Living proof" status="upcoming">
            Running tests and coverage become visible once the platform exposes them; a committed Ukemi
            sample is to be announced.
          </PanelBlock>
          <PanelBlock title="Frozen contract" status="built">
            <p>
              {contract.title} &mdash; produced by {contract.producer} for the gate to conform. Consumed
              and emitted as JSON; the required fields are:
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
            Reachable now over HTTP and MCP as the <code>cascade</code> tool at{" "}
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
