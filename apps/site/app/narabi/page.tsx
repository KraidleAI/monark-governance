import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { NarabiLive } from "@/components/narabi/narabi-live";
import { captureData, captureRef, checkIntegrity } from "@/lib/narabi-live";
import { loadNarabiCalibration, narabiRepoRoot } from "@/lib/narabi-calib-load";
import { loadNarabiCapture } from "@/lib/narabi-capture-load";
import { loadNarabiServed } from "@/lib/narabi-served-load";

// Static metadata only (no generateMetadata — no_generate_metadata_in_apps_site). Digit-free: the window
// size is said as "daily", never "24h".
// Favicon: a STATIC public asset at /icons/narabi.svg, declared here — NOT a
// file-based app/narabi/icon.svg. A per-route app/ icon lands on /narabi/icon.svg, which the production Caddy
// snippet's `handle_path /narabi/*` file_server shadows (serves the sentinel's public dir, no icon.svg -> 404).
// /icons/narabi.svg is outside /narabi/*, so it falls through to Next and stays functional.
export const metadata: Metadata = {
  title: "Narabi — daily · MONARK",
  description:
    "Narabi, the redemption-flow sensor: one attested daily UTC window per line, a published replayable timeline, a pre-registered drift criterion, and a long-run bound printed with T. Read-only.",
  icons: { icon: [{ url: "/icons/narabi.svg", type: "image/svg+xml" }] },
};

const buildSha256 = (bytes: Uint8Array): Promise<string> => Promise.resolve(createHash("sha256").update(bytes).digest("hex"));

// SERVER shell. Everything the board needs at first paint is read HERE, at build, from committed sources that
// the public export carries, each through a fail-closed loader: the committed capture of the two published files
// (apps/site/data/narabi-capture.json, manifest-checked; parsed and projected — no endpoint URL is ever serialised),
// its integrity checks recomputed at build (declared as such on the page), the calibration size and digest (derived
// from the sha-pinned score fixture), and the committed served facts (apps/site/data/narabi-served.json,
// manifest-checked: gate class and key, publication schedule, probe deadline). The browser then reads the files as
// served now, recomputes every check and re-renders; nothing is read from the systemd units, which the export omits.
export default async function NarabiPage() {
  const root = narabiRepoRoot();
  const calibration = loadNarabiCalibration(root);
  const snapshot = loadNarabiCapture(root);
  const served = loadNarabiServed(root);
  const initial = captureData(snapshot);
  const capture = captureRef(snapshot);
  const initialIntegrity = await checkIntegrity(initial, buildSha256);
  return (
    <main className="c-main" style={{ paddingTop: 32 }}>
      <NarabiLive
        initial={initial}
        initialIntegrity={initialIntegrity}
        capture={capture}
        calibration={{ nCalib: calibration.nCalib, calibDigest: calibration.calibDigest }}
        served={{
          gate: { task_class: served.gate.task_class, predictor_id: served.gate.predictor_id },
          sentinel_timer: served.sentinel_timer,
          probe: served.probe,
        }}
      />
    </main>
  );
}
