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
import { HikaeMark } from "@/components/marks/hikae-mark";
import { PanelBlock, SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import { insideFor } from "@/lib/fleet-presentation";
import type { FrozenContract } from "@/lib/load-contract";
import { cn } from "@/lib/utils";

/**
 * The built Hikae agent (the gate itself). Same 8-block template as Shōgen: blocks 1/2/4/6 BUILT,
 * blocks 3/5/7/8 UPCOMING. `contract` is the frozen CoverageVerdict shape Hikae emits, read server-side
 * from schemas/. Block 4 is the C8 honest limit (PLAN F-2 §2/§11): a monitor gives marginal, not
 * conditional, coverage — grounded in packages/hikae/README.md (L1/L2/L3 table) and src/l2-monitor.ts
 * ("MONITOR — no guarantee claimed"). No market number, no probability of being right is rendered.
 */
export function HikaePanel({ contract }: { contract: FrozenContract }) {
  return (
    <Dialog>
      <AgentCard
        mark={<HikaeMark className="size-8" />}
        name="Hikae"
        status="built"
        action={<DialogTrigger render={<Button variant="outline" size="sm" />}>Open panel</DialogTrigger>}
      >
        Coverage-controlled inference &mdash; the gate itself.
      </AgentCard>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <DialogTitle>Hikae</DialogTitle>
          <DialogDescription>Coverage-controlled inference &mdash; the gate itself.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PanelBlock title="How it works" status="built">
            Hikae takes an upstream predictor&rsquo;s reading, conforms it into a coverage region, then
            gates the act: commit, defer, or abstain against the MONARK budget. The product is the right
            to act under attested coverage &mdash; and the right to hold no opinion.
          </PanelBlock>
          <PanelBlock title="How it is built" status="built">
            A conformal split turns the prediction into a set or an interval at a target coverage of one
            minus &alpha;, then a closed gate policy reads that region and the remaining budget to emit commit,
            defer, or abstain.
          </PanelBlock>
          <WhatInside block={insideFor("hikae")} />
          <PanelBlock title="Honest limits" status="built">
            <p>
              Hikae is a monitor &mdash; a second-level check, not a promise about any single case. Its
              coverage holds on average over exchangeable calibration data at one minus a chosen
              miscoverage level &alpha;; it is not conditional on the individual input, so the gate does
              not guarantee conditional coverage, and &alpha; is that miscoverage level (coverage is one
              minus &alpha;), not a probability that a given region is right.
            </p>
            <p className="mt-2">
              The remaining-risk step is a monitoring statistic with no guarantee attached, and the error
              on one committed act is not bounded by &alpha;. Hikae authorizes acts and can hold no
              opinion: it gates order tools, it never calls them, and profit and loss never enter the
              policy.
            </p>
          </PanelBlock>
          <PanelBlock title="Living proof" status="upcoming">
            Running tests and coverage become visible once the platform exposes them; a committed Hikae
            sample is to be announced.
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
            Reachable now over HTTP and MCP as the <code>gate</code> tool at{" "}
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
