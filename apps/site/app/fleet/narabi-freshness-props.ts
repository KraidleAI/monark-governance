// apps/site/app/fleet/narabi-freshness-props.ts — the SERVER side of the Narabi freshness line on / and /fleet: the two
// props the client island receives, read at build from committed, hashed data through fail-closed loaders — the
// publication schedule and the external probe's deadline (lib/narabi-served-load.ts, the same facts /narabi judges
// lateness against) and the facts of the committed capture (lib/narabi-capture-load.ts: its date, its last published
// window, its tracker step). The capture is parsed HERE, so neither its body nor any endpoint count reaches the client.
import { parseState, parseTimeline, type PublishSchedule } from "@/lib/narabi-live";
import { loadNarabiServed } from "@/lib/narabi-served-load";
import { loadNarabiCapture } from "@/lib/narabi-capture-load";
import type { FreshnessCapture } from "./narabi-freshness";

export interface NarabiFreshnessProps {
  readonly schedule: PublishSchedule;
  readonly capture: FreshnessCapture;
}

export function narabiFreshnessProps(rootDir: string): NarabiFreshnessProps {
  const served = loadNarabiServed(rootDir);
  const snap = loadNarabiCapture(rootDir);
  const lines = parseTimeline(snap.timelineJsonl);
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  return {
    schedule: {
      on_calendar_utc: served.sentinel_timer.on_calendar_utc,
      randomized_delay_s: served.sentinel_timer.randomized_delay_s,
      deadline_utc: served.probe.deadline_utc,
    },
    capture: { capturedAt: snap.capturedAt, lastDay: last ? last.day : null, step: parseState(snap.stateJson).tracker.t },
  };
}
