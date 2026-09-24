"use client";

// apps/site/app/fleet/narabi-freshness.tsx — the freshness line of the built Narabi sensor on the register surfaces (/ and
// /fleet): the day of the last published window, the tracker step and whether a window is late, READ from the two
// same-origin files the sentinel publishes (/narabi/state.json, /narabi/timeline.jsonl). Lateness is judged exactly as the
// /narabi page judges it (lagView and liveWord of lib/narabi-live) against the publication schedule and the external
// probe's deadline that the server page hands in from the committed, hashed served facts (lib/narabi-served-load.ts) —
// never a typed hour. Until the files as served now are read, and when they cannot be read or parsed (a dev server has no
// file server), the line shows the facts of the committed capture, handed in by the server page from
// lib/narabi-capture-load.ts and DECLARED as a capture with its date; on a capture the lateness is unknown (a capture is old
// by construction, its age is never attributed to the sentinel). No endpoint list reaches this island. Every value renders
// through a property read; no number is typed.
import { useEffect, useState } from "react";
import {
  LIVE_SOURCE,
  STATE_PATH,
  TIMELINE_PATH,
  lagView,
  liveWord,
  parseState,
  parseTimeline,
  type NarabiData,
  type PublishSchedule,
} from "@/lib/narabi-live";

/** The facts of the committed capture the line shows until (or instead of) the read of the files as served now. */
export interface FreshnessCapture {
  readonly capturedAt: string;
  readonly lastDay: string | null;
  readonly step: number;
}

type View = { readonly kind: "live"; readonly lastDay: string | null; readonly step: number; readonly word: string } | { readonly kind: "unread" };

async function sameOriginText(path: string): Promise<string> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${path}`);
  return res.text();
}

export function NarabiFreshness({ schedule, capture }: { schedule: PublishSchedule; capture: FreshnessCapture }) {
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    let alive = true;
    const read = async (): Promise<void> => {
      try {
        const [stateText, timelineText] = await Promise.all([sameOriginText(STATE_PATH), sameOriginText(TIMELINE_PATH)]);
        const state = parseState(stateText);
        const lines = parseTimeline(timelineText);
        const data: NarabiData = {
          state,
          lines,
          sourceKind: "live",
          source: LIVE_SOURCE,
          readAt: new Date().toISOString(),
          publishedAt: { state: null, timeline: null },
          liveError: null,
          extendsCapture: null,
        };
        const { lag } = lagView(data, schedule);
        const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
        if (alive) setView({ kind: "live", lastDay: last ? last.day : null, step: state.tracker.t, word: liveWord(data, lag) });
      } catch {
        // A failed read and an unparseable file both land here; the label says "could not be read", true of both.
        if (alive) setView({ kind: "unread" });
      }
    };
    void read();
    return () => {
      alive = false;
    };
  }, [schedule]);

  if (view !== null && view.kind === "live") {
    return (
      <span className="c-mono c-small">
        last published window {view.lastDay ?? "—"} · tracker step {view.step} · {view.word}
      </span>
    );
  }
  return (
    <span className="c-mono c-small" aria-live="polite">
      committed capture of {capture.capturedAt}: last published window {capture.lastDay ?? "—"} · tracker step {capture.step} ·{" "}
      {view === null
        ? "reading the files as served now…"
        : "the files as served now could not be read from this page, so whether a window is late is unknown"}
    </span>
  );
}
