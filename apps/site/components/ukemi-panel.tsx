"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agent-card";
import { UkemiMark } from "@/components/marks/ukemi-mark";
import { PanelBlock, SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import { FLEET_AGENTS } from "@/lib/fleet";
import { insideFor } from "@/lib/fleet-presentation";
import type { FrozenContract } from "@/lib/load-contract";
import { UKEMI_ROUTE, UKEMI_COURSE_ROUTE } from "@/lib/ukemi-copy";
import { CASCADE_UNCALIBRATED_SENTENCE, LIQ_TASK_CLASS } from "@/lib/ukemi-panel-copy";
import { cn } from "@/lib/utils";

// The register (lib/fleet.ts) is the single source of truth for Ukemi's built/upcoming status:
// this bespoke Home panel READS it instead of hard-coding "built", so a register flip flows here. Fail-
// closed: a missing entry throws at prerender rather than render a stale status (pinned by the root test
// fleet_register_built_set_is_frozen, guard (5)).
const UKEMI = FLEET_AGENTS.find((a) => a.name === "Ukemi");
if (!UKEMI) throw new Error("Ukemi is absent from FLEET_AGENTS (register is the single source of truth)");
// Read at module scope, where the fail-closed narrow above holds (closure capture would widen it back). The card line
// is the register's own line (never retyped here), so a register rewrite flows to this panel.
const UKEMI_STATUS = UKEMI.status;
const UKEMI_LINE = UKEMI.line;

/**
 * The built Ukemi agent. `contract` is the frozen Prediction shape Ukemi emits for the gate, read server-side from
 * schemas/. Block 1 scopes the cascade tool with its served downstream sentence (byte-identical to the gate module,
 * root test), preceded by the class it applies to, and makes no claim that the gate conforms it: no cascade
 * calibration is committed. It names the liquidation-exposure class without a calibration adjective: what the gate
 * serves for that class is stated on the Ukemi page, from the served description. The honest-limits block states
 * that uniqueness is lost when the recovery rates fall below full recovery — grounded in packages/ukemi/README.md
 * ("Uniqueness LOST once α < 1 or β < 1 ... we never claim uniqueness outside α = β = 1"). A served fact sits only in
 * a built block: the published course report is stated in "How it is built", and the upcoming "Living proof" block
 * says only what is not published yet (test built_panels_keep_served_facts_in_built_blocks). The shared "What's
 * inside" block is rendered: its points say region, delivered by the gate only once a calibration is committed, never
 * an interval nor a region "conformed by the gate" today, which the served sentence above would contradict (the root
 * test site-ukemi reds if such a point comes back). No market number is typed.
 */
export function UkemiPanel({ contract }: { contract: FrozenContract }) {
  return (
    <Dialog>
      <AgentCard
        mark={<UkemiMark className="size-8" />}
        name="Ukemi"
        status={UKEMI_STATUS}
        action={<DialogTrigger render={<Button variant="outline" size="sm" />}>Open panel</DialogTrigger>}
      >
        {UKEMI_LINE}
      </AgentCard>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <DialogTitle>Ukemi</DialogTitle>
          <DialogDescription>{UKEMI_LINE}</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PanelBlock title="How it works" status="built">
            Ukemi&rsquo;s cascade tool computes, in a way anyone can recompute, how much of a position or a pool
            is liquidable under a shock, and emits that as a numeric prediction for the gate. Downstream, for the
            cascade tool&rsquo;s class, {CASCADE_UNCALIBRATED_SENTENCE}. The gate also takes Ukemi&rsquo;s
            liquidation-exposure measure, under a separate class, <code>{LIQ_TASK_CLASS}</code>: the{" "}
            <Link href={UKEMI_ROUTE} className="underline underline-offset-4">
              Ukemi page
            </Link>{" "}
            describes that measure and states what the gate serves for it.
          </PanelBlock>
          <PanelBlock title="How it is built" status="built">
            <p>
              A network clearing fixed point &mdash; each node pays what it can, in rounds &mdash; measures
              how a local shock is amplified across the payment network, using recovery rates &alpha; and
              &beta; for external and interbank assets in liquidation.
            </p>
            <p className="mt-2">
              Published: the offline calibration course on one recorded lending episode, with its pre-registered
              outcomes and its report digest, on the{" "}
              <Link href={UKEMI_COURSE_ROUTE} className="underline underline-offset-4">
                course page
              </Link>
              .
            </p>
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
            A record read on a lending venue as it happens is upcoming.
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
            <code>mcp.monarkgate.tech/mcp</code>, and through the <code>gate</code> tool under the{" "}
            <code>{LIQ_TASK_CLASS}</code> class (the Ukemi page states what it serves). See For integrators for the
            add one-liners.
          </PanelBlock>
          <PanelBlock title="Traceability" status="upcoming">
            Every figure and decision links to its committed, hashed source in the audit console.
          </PanelBlock>
        </div>
      </DialogContent>
    </Dialog>
  );
}
