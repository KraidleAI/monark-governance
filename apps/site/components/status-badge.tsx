import type { AgentStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * Renders the honest status pill. The label text is a JSX literal (scanned by the honesty lint,
 * test 44) — never a market number. A "built" pill is only ever placed on something genuinely
 * built; the roadmap teasers carry "upcoming".
 */
export function StatusBadge({ status, className }: { status: AgentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        status === "built"
          ? "border-accent/50 bg-accent/15 text-foreground"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {status === "built" ? "Built" : "Upcoming"}
    </span>
  );
}
