"use client";

// apps/site/components/noyau/noyau.tsx
// The MONARK "noyau" (investor delivery of 2026-09-23, see COMPONENTS-PROVENANCE.md), in place of the landing-page
// cubes. HONESTY (site adaptation): WHICH agents are drawn and the group of each are READ from the fleet register
// (lib/fleet.ts, the single source of truth): every FLEET_AGENTS entry with its status, then MONARK Bell from
// PRODUCTS (key "bell") with its status. The group handed to the engine IS the register status word ("built" |
// "upcoming"), passed through unchanged: built agents travel between the two orbits (solid ring), upcoming agents
// wait on the dashed ring. Nothing that is absent from the register is drawn; a register entry with no mark in
// LOOK below fails the build (the page.tsx statusOf idiom). Marks come straight from components/marks (Bell: the
// BellMark of components/lockups, the one the home fleet strip renders); colours are the site's own tokens, read by
// the engine; the light/dark switch follows the ThemeProvider with a short fade, and reduced motion gives a still
// frame. Transparent, with edges fading into the page paper. Fills its container: give it a size.
import { useEffect, useRef, type ComponentType, type CSSProperties, type SVGProps } from "react";
import { useTheme } from "@/components/theme-provider";
import { FLEET_AGENTS, PRODUCTS, type FleetStatus } from "@/lib/fleet";
import { BellMark } from "@/components/lockups";
import { ShogenMark } from "@/components/marks/shogen-mark";
import { HikaeMark } from "@/components/marks/hikae-mark";
import { UkemiMark } from "@/components/marks/ukemi-mark";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { MokugekiMark } from "@/components/marks/mokugeki-mark";
import { KaihiMark } from "@/components/marks/kaihi-mark";
import { KessaiMark } from "@/components/marks/kessai-mark";
import { KamaeMark } from "@/components/marks/kamae-mark";
import { KyokusenMark } from "@/components/marks/kyokusen-mark";
import { KoyomiMark } from "@/components/marks/koyomi-mark";
import { GenkanMark } from "@/components/marks/genkan-mark";
import { NoyauEngine, readSitePalette, type AgentSpec } from "./noyau-engine";

type Mark = ComponentType<SVGProps<SVGSVGElement>>;
type Agent = AgentSpec & { Mark: Mark };

// Presentation only, keyed by the register name: a stable id, the accent hard-coded in each mark, the mark. NO status
// lives here (the status is the register's).
const LOOK: Record<string, { id: string; accent: string; Mark: Mark }> = {
  Shōgen: { id: "shogen", accent: "#FF6B4A", Mark: ShogenMark },
  Hikae: { id: "hikae", accent: "#12857A", Mark: HikaeMark },
  Ukemi: { id: "ukemi", accent: "#5661C9", Mark: UkemiMark },
  Narabi: { id: "narabi", accent: "#B8922E", Mark: NarabiMark },
  Mokugeki: { id: "mokugeki", accent: "#4E6E8E", Mark: MokugekiMark },
  Kaihi: { id: "kaihi", accent: "#E06B2E", Mark: KaihiMark },
  Kessai: { id: "kessai", accent: "#2E8B57", Mark: KessaiMark },
  Kamae: { id: "kamae", accent: "#7A5AC2", Mark: KamaeMark },
  Kyokusen: { id: "kyokusen", accent: "#C0478F", Mark: KyokusenMark },
  Koyomi: { id: "koyomi", accent: "#1E9AA6", Mark: KoyomiMark },
  Genkan: { id: "genkan", accent: "#B06A4A", Mark: GenkanMark },
  Bell: { id: "bell", accent: "#0F8F74", Mark: BellMark },
};

function fromRegister(name: string, status: FleetStatus): Agent {
  const look = LOOK[name];
  if (!look) throw new Error(`noyau: register entry '${name}' has no mark (components/noyau/noyau.tsx LOOK)`);
  return { id: look.id, name, accent: look.accent, group: status, Mark: look.Mark };
}

const BELL = PRODUCTS.find((p) => p.key === "bell");
if (!BELL) throw new Error("noyau: MONARK Bell is absent from PRODUCTS (lib/fleet.ts), the single source of its status");

// The drawn set IS the register: the fleet agents in register order, then MONARK Bell (a product), status read.
const AGENTS: readonly Agent[] = [...FLEET_AGENTS.map((a) => fromRegister(a.name, a.status)), fromRegister("Bell", BELL.status)];

// The two legend entries are the register's own status words (typed FleetStatus: a stray word fails typecheck).
const LEGEND: readonly FleetStatus[] = ["built", "upcoming"];
const namesOf = (s: FleetStatus): string => AGENTS.filter((a) => a.group === s).map((a) => a.name).join(", ");
const ARIA = `MONARK: one gate at the core, two orbits and a dashed ring. Built: ${namesOf("built")}. Upcoming: ${namesOf("upcoming")}.`;
const MASK = "radial-gradient(ellipse closest-side at 50% 50%, #000 80%, transparent 100%)";
const LEGEND_SPACE = 24;

const layer: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" };

function beadStyle(agent: Agent): CSSProperties {
  const built = agent.group === "built";
  return {
    position: "absolute",
    left: 0,
    top: 0,
    boxSizing: "border-box",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "var(--card)",
    color: "var(--ink)",
    border: built ? "none" : `1px dashed ${agent.accent}99`,
    boxShadow: built ? `0 0 0 1.5px ${agent.accent}, 0 0 18px ${agent.accent}33` : "none",
    opacity: 0,
    transformOrigin: "50% 50%",
    willChange: "transform, opacity",
    transition: "filter .35s ease, background-color .45s ease, color .45s ease",
    pointerEvents: "none",
  };
}

function labelStyle(agent: Agent): CSSProperties {
  const built = agent.group === "built";
  return {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 5,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
    fontWeight: built ? 500 : 400,
    fontSize: built ? 12.5 : 11,
    lineHeight: 1,
    color: built ? "var(--ink)" : "var(--ink2)",
    textShadow: "0 0 4px var(--paper), 0 0 2px var(--paper)",
    opacity: 0,
    willChange: "transform, opacity",
    transition: "color .45s ease",
    pointerEvents: "none",
  };
}

// Legend marker: a solid ring for built, a dashed ring for upcoming (the bead outlines, in ink).
const ring = (s: FleetStatus): CSSProperties =>
  s === "built"
    ? { width: 8, height: 8, boxSizing: "border-box", borderRadius: "50%", border: "1.5px solid var(--ink)", flex: "none" }
    : { width: 8, height: 8, boxSizing: "border-box", borderRadius: "50%", border: "1px dashed var(--ink2)", flex: "none" };

export function Noyau({ className, legend = true, speed = 1 }: { className?: string; legend?: boolean; speed?: number }) {
  const { theme, reducedMotion } = useTheme();
  const initial = useRef({ theme, reducedMotion, legend, speed });
  const sceneRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const beads = useRef<Record<string, HTMLDivElement | null>>({});
  const labels = useRef<Record<string, HTMLSpanElement | null>>({});
  const engine = useRef<NoyauEngine | null>(null);

  useEffect(() => {
    const root = sceneRef.current, back = backRef.current, front = frontRef.current;
    if (!root || !back || !front) return;
    const start = initial.current;
    const e = new NoyauEngine({
      root,
      back,
      front,
      beads: beads.current,
      labels: labels.current,
      agents: AGENTS,
      palette: readSitePalette,
      theme: start.theme,
      reducedMotion: start.reducedMotion,
      speed: start.speed,
      reserveBottom: start.legend ? LEGEND_SPACE : 0,
    });
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    engine.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div
        ref={sceneRef}
        role="img"
        aria-label={ARIA}
        style={{ position: "absolute", inset: 0, maskImage: MASK, WebkitMaskImage: MASK, touchAction: "pan-y", cursor: "grab", userSelect: "none" }}
      >
        <canvas ref={backRef} style={{ ...layer, zIndex: 1, filter: "blur(0.7px)", opacity: 0.85 }} />
        {AGENTS.map((agent) => (
          <div
            key={agent.id}
            ref={(el) => {
              beads.current[agent.id] = el;
            }}
            data-agent={agent.name}
            data-status={agent.group}
            style={beadStyle(agent)}
          >
            <agent.Mark style={{ width: "86%", height: "86%" }} />
          </div>
        ))}
        <canvas ref={frontRef} style={{ ...layer, zIndex: 3 }} />
        {AGENTS.map((agent) => (
          <span
            key={agent.id}
            ref={(el) => {
              labels.current[agent.id] = el;
            }}
            style={labelStyle(agent)}
            aria-hidden="true"
          >
            {agent.name}
          </span>
        ))}
      </div>
      {legend ? (
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: 4, bottom: 4, display: "flex", alignItems: "center", gap: 16, fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1, pointerEvents: "none" }}
        >
          {LEGEND.map((s) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: 7, color: s === "built" ? "var(--ink)" : "var(--ink2)" }}>
              <i style={ring(s)} />
              {s}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
