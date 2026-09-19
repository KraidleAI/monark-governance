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
import { LEVELS, WINDOW_STEPS, GATE, NOT_LIST } from "@/lib/narabi-copy";
import type { FrozenContract } from "@/lib/load-contract";
import { cn } from "@/lib/utils";

/**
 * The built Narabi sensor (redemption-run velocity, ADR-M012 M012-e). Same 8-block template as Hikae.
 * `contract` is the frozen AttestedFlow shape Narabi emits, read server-side from schemas/; the required
 * fields render via {field}, never hard-coded. "Living proof" links to the live daily timeline on the
 * bare /narabi route (F-site-10; NARABI_ROUTE reused). No market number, no rendered numeric literal, no
 * frozen-contract field name quoted; the tracker is adaptive, the committed gate region is not.
 */
export function NarabiPanel({ contract }: { contract: FrozenContract }) {
  return (
    <Dialog>
      <AgentCard
        mark={<NarabiMark className="size-8" />}
        name="Narabi"
        status="built"
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
            <p>
              Narabi reads the attested redemption flow &mdash; burns, mints and closing supply over a
              declared block window, recomputable onchain &mdash; and steps a quantile tracker on the
              realized outcome each window, publishing the whole timeline.
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {WINDOW_STEPS.map((st) => (
                <li key={st} className="pl-1">{st}</li>
              ))}
            </ol>
          </PanelBlock>
          <PanelBlock title="What it measures" status="built">
            <ul className="space-y-1.5">
              {LEVELS.map((lv) => (
                <li key={lv.name}>
                  <span className="font-mono text-xs uppercase tracking-wide text-monark-t">{lv.name}</span>{" "}
                  <span>{lv.claim}</span>
                </li>
              ))}
            </ul>
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
            <p className="mt-2">
              The bound printed with each step is a long-run quantity that stays above its target for a
              long time; the page prints the projected day rather than hiding it. A drift opens a review,
              never an automatic change.
            </p>
            <ul className="mt-2 space-y-1">
              {NOT_LIST.map((n) => (
                <li key={n} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">&times;</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </PanelBlock>
          <PanelBlock title="What the gate does with it" status="built">
            <p>{GATE.body}</p>
            <p className="mt-2">
              Task class <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{GATE.cls}</code>
            </p>
          </PanelBlock>
          <PanelBlock title="Living proof" status="built">
            The daily timeline is live &mdash;{" "}
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
            Reachable now over HTTP and MCP through the <code>gate</code> tool at{" "}
            <code>mcp.monarkgate.tech/mcp</code>, under the stable-run velocity class. The attested flow and
            its timeline are served as plain files from the Narabi page. See For integrators for the add
            one-liners.
          </PanelBlock>
          <PanelBlock title="Traceability" status="built">
            Every step carries a per-line hash chained to the previous one, the sentinel version that
            wrote it and the endpoints it read; the published timeline replays to the byte from its
            committed source. A rewrite is detectable by anyone holding an older copy; the only guarantor
            of the facts is the onchain recompute.
          </PanelBlock>
        </div>
      </DialogContent>
    </Dialog>
  );
}
