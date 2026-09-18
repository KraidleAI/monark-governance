import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NarabiLive } from "@/components/narabi/narabi-live";

// Static metadata only (no generateMetadata — no_generate_metadata_in_apps_site). Digit-free: the window
// size is said as "daily", never "24h".
export const metadata: Metadata = {
  title: "Narabi — daily · MONARK",
  description:
    "Narabi, the redemption-flow sensor: one attested daily UTC window per line, a published replayable timeline, a pre-registered drift criterion, and a long-run bound printed with T. Read-only.",
};

// The publish schedule is read from the committed systemd timer unit (single source of truth), server-side
// at build — the same repo-root read the /fleet page uses for schemas/. It is passed to the client board so
// the "lag" line states when the next window is expected, never a bare hard-coded time.
function publishSchedule(): string {
  try {
    const root = join(process.cwd(), "..", "..");
    const unit = readFileSync(join(root, "deploy", "monark-sentinel.timer"), "utf8");
    const onCal = /OnCalendar=\S+\s+(\d{2}:\d{2}):\d{2}\s*UTC/.exec(unit);
    const jitter = /RandomizedDelaySec=(\d+)/.exec(unit);
    const clock = onCal ? onCal[1] : "00:30";
    const minutes = jitter ? Math.round(Number(jitter[1]) / 60) : 30;
    return `${clock} UTC, plus up to a ${String(minutes)}-minute randomized delay (monark-sentinel.timer)`;
  } catch {
    return "the daily schedule declared in monark-sentinel.timer";
  }
}

export default function NarabiPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <NarabiLive publishSchedule={publishSchedule()} />
    </main>
  );
}
