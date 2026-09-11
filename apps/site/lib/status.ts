// apps/site/lib/status.ts — the frozen public status vocabulary.
// Only two statuses exist on the public storefront: a thing is BUILT, or it is UPCOMING. There is
// deliberately NO "live" — that belongs to the future live level (F-live), and a `status: "live"`
// therefore does NOT type-check (a compile-time oracle: `next build` reds). Used for both agent
// cards and the per-agent panel blocks.
export type AgentStatus = "built" | "upcoming";
