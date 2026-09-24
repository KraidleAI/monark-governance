"use client";

import type { InsideBlock } from "@/lib/fleet-presentation";
import { PanelBlock } from "@/components/panel-shell";

/**
 * The Mod #1 block: "What's inside" (a built agent) or "What it will use" (an upcoming agent,
 * product, or visage), rendered from lib/fleet-presentation.ts (F-site-6 C-8). Points are JSX child
 * expressions (the honesty lint, test 44, scans them); the status flows from the block's kind, never a
 * hard-coded literal. An upcoming block closes with a SINGLE "(more details to come)" (the standard
 * format), not one per point. Replaces the old "Sourced bibliography" block in the three built panels.
 */
export function WhatInside({ block }: { block: InsideBlock }) {
  const built = block.kind === "built";
  return (
    <PanelBlock title={built ? "What's inside" : "What it will use"} status={block.kind}>
      <ul className="flex flex-col gap-1.5">
        {block.points.map((point) => (
          <li key={point} className="flex gap-2">
            <span aria-hidden="true" className="select-none text-muted-foreground">&middot;</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      {built ? null : <p className="mt-2 text-xs italic text-muted-foreground">(more details to come)</p>}
    </PanelBlock>
  );
}
