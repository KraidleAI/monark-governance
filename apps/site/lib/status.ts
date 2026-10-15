// apps/site/lib/status.ts — the frozen public status vocabulary.
// A thing on the public storefront is BUILT, or it is UPCOMING; one panel block alone may be BUILDING (below). There is
// deliberately NO "live" — that belongs to the future live level (F-live), and a `status: "live"`
// therefore does NOT type-check (a compile-time oracle: `next build` reds). Used for both agent
// cards and the per-agent panel blocks.
export type AgentStatus = "built" | "upcoming";
// BUILDING: a panel block whose composition does not run yet while its construction item is open in the piece's register.
// It is not an AgentStatus, so no card, no register row and no PanelBlock can carry it; only the building block of
// components/panel-shell.tsx takes it. A test of the /fleet page, rendered with every panel open, reds on a second building
// text, within the bounds its title names; a first net reds when the name of that block appears in a .ts or .tsx file under
// app, components or lib anywhere but its definition and the Shōgen panel.
export type BuildingStatus = "building";
