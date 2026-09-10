import type { Metadata } from "next";

// Static metadata only (ADR-M004 D15 / honesty lint §6b): no digit in title/description, and NO
// generateMetadata (gate no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "Writing — MONARK",
  description:
    "One note, one reading: each note is a published paper the fleet has read — what holds, what the fleet uses, and what is not claimed.",
};

// /writing (server component) — "Writing · notes". Design section L407-421 on the shell mounted by the
// layout (header/footer NOT re-mounted). The long-form paragraph is set in the Newsreader serif
// (font-serif, wired in globals.css). No note is published yet: the format of a note is shown, badged
// "First note: Upcoming". Honest by construction — zero numeric literal, no claim of a result.
export default function WritingPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pt-16 pb-22">
      <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
        Writing · notes
      </div>
      <h1 className="mt-3 mb-4 font-heading text-[clamp(34px,4.5vw,56px)] font-semibold tracking-[-0.025em] text-balance">
        One note, one reading.
      </h1>
      <p className="mb-9 font-serif text-[20px] leading-[1.6] text-muted-foreground">
        Each note here is a single published paper, actually read, and what the fleet takes from it —
        where the method holds, where it does not, and what MONARK refuses to claim as a result. Notes
        publish only once their reading is committed to the public repository with its source.
      </p>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="font-mono text-xs text-muted-foreground">Format of a note</span>
          <span className="rounded-full border border-border px-[9px] py-[3px] font-mono text-[11px] text-muted-foreground">
            First note: Upcoming
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5 text-sm leading-[1.5] text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">The reading</span>
            <br />
            Citation, year, hash of the copy read.
          </div>
          <div>
            <span className="font-medium text-foreground">What holds</span>
            <br />
            The result, in the paper&apos;s own terms.
          </div>
          <div>
            <span className="font-medium text-foreground">What the fleet uses</span>
            <br />
            The exact step, and the agent it lives in.
          </div>
          <div>
            <span className="font-medium text-foreground">What is not claimed</span>
            <br />
            The limit, named.
          </div>
        </div>
      </div>
    </main>
  );
}
