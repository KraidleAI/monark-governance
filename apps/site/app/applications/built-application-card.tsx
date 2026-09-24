import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Placeholder, placeholderName, type PlaceholderState } from "@/components/placeholder";
import { WhatInside } from "@/components/what-inside";
import type { InsideBlock } from "@/lib/fleet-presentation";
import { capitalized, type BuiltFleetProduct } from "@/lib/fleet";

// A BUILT application on /applications (MONARK Bell). A SERVER component on purpose: it reads the product's served
// wiring on the server and renders only its digit-free `served.note`, so the served wiring metadata never reaches a client
// component's props nor the page payload. Everything shown comes from the register (lib/fleet.ts), the panel content
// (lib/fleet-presentation.ts) or committed, hashed served facts handed in by the page — nothing is typed here. A register
// string that is still a named placeholder `<<name>>` (Bell's segment and reach) renders as that placeholder in the state
// "to be decided", never with the "upcoming" default next to the product's "built" pill.

export interface BuiltApplicationLink {
  readonly href: string;
  readonly label: string;
  /** true for a URL on another host (a plain anchor), false for a site route. */
  readonly external: boolean;
}

export interface BuiltApplicationFact {
  readonly label: string;
  readonly value: string;
}

/** The state of an undecided register value on a BUILT product: decided later, not upcoming. */
const UNDECIDED: PlaceholderState = "to be decided";

function RegisterValue({ text }: { text: string }) {
  const name = placeholderName(text);
  return name === null ? <>{text}</> : <Placeholder name={name} state={UNDECIDED} />;
}

export function BuiltApplicationCard({
  product,
  inside,
  facts,
  links,
}: {
  product: BuiltFleetProduct;
  inside: InsideBlock;
  facts: readonly BuiltApplicationFact[];
  links: readonly BuiltApplicationLink[];
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-lg font-medium text-card-foreground">{product.name}</h3>
        <StatusBadge status={product.status} className="ml-auto" />
      </div>
      <p className="text-xs text-muted-foreground">
        Segment: <RegisterValue text={product.segment} />
      </p>
      <p className="text-sm text-muted-foreground">{product.fn}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <dt className="text-foreground">sensor</dt>
        <dd>{product.wiring.sensor}</dd>
        <dt className="text-foreground">gate</dt>
        <dd>{product.wiring.gate}</dd>
        <dt className="text-foreground">act</dt>
        <dd>{product.wiring.act}</dd>
      </dl>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground">How it is served</p>
        <p className="mt-1 text-sm text-muted-foreground">{capitalized(product.served.note)}.</p>
        {facts.map((fact) => (
          <p key={fact.label} className="mt-1 font-mono text-xs text-muted-foreground">
            {fact.label} · {fact.value}
          </p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Connects: <RegisterValue text={product.connects} />
      </p>
      <WhatInside block={inside} />
      <div className="mt-auto flex flex-wrap items-center gap-4 pt-1 text-sm">
        {links.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} className="underline underline-offset-4">
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="underline underline-offset-4">
              {link.label}
            </Link>
          ),
        )}
      </div>
    </article>
  );
}
