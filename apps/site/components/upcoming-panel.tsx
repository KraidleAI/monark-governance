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
import { StatusBadge } from "@/components/status-badge";
import { SHEET } from "@/components/panel-shell";
import { WhatInside } from "@/components/what-inside";
import { RegisterText, placeholderName } from "@/components/placeholder";
import { insideFor } from "@/lib/fleet-presentation";
import type { FleetProduct } from "@/lib/fleet";
import { cn } from "@/lib/utils";

/**
 * Sober sensor -> gate -> act wiring diagram. Ink = currentColor; decorative
 * (aria-hidden) — the per-product list beside it is the accessible, concrete wiring. SVG geometry
 * attributes are ignored by the honesty lint (test 44), like the agent marks; no rendered number.
 */
function WiringSchema() {
  return (
    <svg
      viewBox="0 0 300 62"
      fill="none"
      className="h-auto w-full max-w-xs text-muted-foreground"
      aria-hidden="true"
      focusable="false"
    >
      {[8, 111, 214].map((x) => (
        <rect key={x} x={x} y={18} width={78} height={26} rx={6} stroke="currentColor" strokeWidth={1.5} />
      ))}
      <path
        d="M88,31 L109,31 M109,31 l-5,-3 M109,31 l-5,3 M191,31 L212,31 M212,31 l-5,-3 M212,31 l-5,3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x={47} y={35} textAnchor="middle" fontSize={12} fill="currentColor">sensor</text>
      <text x={150} y={35} textAnchor="middle" fontSize={12} fill="currentColor">gate</text>
      <text x={253} y={35} textAnchor="middle" fontSize={12} fill="currentColor">act</text>
    </svg>
  );
}

/**
 * A single UPCOMING product placeholder (ADR-M004 D14). A segment card opens
 * it. Honest and LIGHT: not the eight-block built template, and no Frozen contract / Living proof /
 * Bibliography (a product that is not built has nothing built to show). Exactly ONE status signal — the
 * product-level Upcoming badge. The wiring names Ukemi / Hikae where they are the engine, with NO
 * "Built" pill on any node (C-10); MONARK Verdict stays generic (C-1). `status` flows from the fleet
 * register (lib/fleet.ts), never hard-coded here. A register string that is a named placeholder `<<name>>`
 * (MONARK Bell's segment, wiring and reach — ruling Q3) renders as a Placeholder, never as a value.
 */
export function UpcomingPanel({ product }: { product: FleetProduct }) {
  const gateIsPlaceholder = placeholderName(product.wiring.gate) !== null;
  return (
    <Dialog>
      <article className="flex flex-col gap-2 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-medium text-card-foreground">
            <RegisterText text={product.segment} />
          </h3>
          <StatusBadge status={product.status} className="ml-auto" />
        </div>
        <p className="text-sm text-muted-foreground">{product.fn}</p>
        <p className="text-xs text-muted-foreground">
          {gateIsPlaceholder ? (
            <>
              Gate: <RegisterText text={product.wiring.gate} />
            </>
          ) : (
            <>Cleared by the same gate: {product.wiring.gate}.</>
          )}
        </p>
        <div className="mt-auto pt-1">
          <DialogTrigger render={<Button variant="outline" size="sm" />}>See {product.name}</DialogTrigger>
        </div>
      </article>

      <DialogContent className={cn(SHEET)}>
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2">
            <DialogTitle>{product.name}</DialogTitle>
            <StatusBadge status={product.status} className="ml-auto" />
          </div>
          <DialogDescription>{product.fn}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4 text-sm text-muted-foreground">
          <p>A product is a wiring of fleet agents; the agent is the engine.</p>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground">Wiring</p>
            <WiringSchema />
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-foreground">sensor</dt>
              <dd>
                <RegisterText text={product.wiring.sensor} />
              </dd>
              <dt className="text-foreground">gate</dt>
              <dd>
                <RegisterText text={product.wiring.gate} />
              </dd>
              <dt className="text-foreground">act</dt>
              <dd>
                <RegisterText text={product.wiring.act} />
              </dd>
            </dl>
          </div>
          <p>
            <RegisterText text={product.connects} />
          </p>
          <WhatInside block={insideFor(product.key)} />
          <p className="text-xs">To be announced.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
