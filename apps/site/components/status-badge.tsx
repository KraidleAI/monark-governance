import type { AgentStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * Renders the honest status pill — charter C (decision 145): the register's own word, lower-case, `built` or
 * `upcoming`, in the charter pill (a filled dot for built, a hollow dot for upcoming). The label text is a JSX
 * literal (scanned by the honesty lint, test 44) — never a market number. A "built" pill is only ever placed on
 * something genuinely built; the roadmap teasers carry "upcoming".
 */
export function StatusBadge({ status, className }: { status: AgentStatus; className?: string }) {
  return (
    <span className={cn("c-pill", status === "built" ? "c-pill--built" : "c-pill--upcoming", className)}>
      {status === "built" ? "built" : "upcoming"}
    </span>
  );
}
