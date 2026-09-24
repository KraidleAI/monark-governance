import type { ReactNode } from "react";
import type { AgentStatus } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

/**
 * Presentational fleet-agent card (server-safe, usable inside a client panel too). `mark` is the
 * agent mark (ink = currentColor, set by the wrapper's text colour); `children` is the one-line
 * descriptor written as JSX so the honesty lint scans it. `action` is an optional footer slot — each
 * of the three built agents (Shōgen, Hikae, Ukemi) passes a panel trigger there; a card never carries
 * an "upcoming" badge.
 */
export function AgentCard({
  mark,
  name,
  status,
  action,
  className,
  children,
}: {
  mark: ReactNode;
  name: string;
  status: AgentStatus;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={cn("flex flex-col gap-3 rounded-xl border bg-card p-5", className)}>
      <div className="flex items-center gap-3">
        <span className="text-primary">{mark}</span>
        <h3 className="font-heading text-lg font-medium text-card-foreground">{name}</h3>
        <StatusBadge status={status} className="ml-auto" />
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
      {action ? <div className="mt-auto pt-1">{action}</div> : null}
    </article>
  );
}
