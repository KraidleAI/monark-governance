"use client";

// apps/site/components/bell-scene.tsx
// The /bell hero scene, native to the page (investor request 2026-09-24: "the text and the animation side by side,
// do not shrink the animation, one block with the text, no frame"). Replaces the vendored iframe
// public/scene/blocks-hero.html, whose own document kept its requestAnimationFrame loop running while scrolled out
// of view and repainted from a cold frame when scrolled back (the lag the investor saw). Same drawing, same palette,
// same four labels (the tokens Bell measures); Canvas 2D, no library. Differences that matter:
//   - the loop is SUSPENDED while the canvas is out of the viewport (IntersectionObserver) and while the document is
//     hidden, and resumes from the wall clock, so coming back never replays a backlog;
//   - the canvas follows its container's size (ResizeObserver), not the window's, so it can sit beside the text;
//   - reduced motion draws one still frame, redrawn on resize;
//   - transparent background; the page paper shows through, no border, no frame.

import { useEffect, useRef } from "react";

const MINT = "#0F8F74";
const MINT_L = "#5EE6C2";
const LAV = "#5B47C9";
const LAV_L = "#B7A6FF";
const INK = "#14151B";
const SX = 1;
const RAD = 5.6;
const HFOV = 44; // horizontal field of view cap, degrees
const N = 44;
// The four tokens Bell measures; the labels are the only text the scene draws besides the two clocks and two sides.
const TICK = ["TSLAx", "NVDAx", "AAPLx", "SPYx"];

type P3 = [number, number, number];

function hex(h: string): [number, number, number] {
  if (h[0] !== "#") return [0, 0, 0];
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",") + ")";
}

/** One scene: owns the camera and the stamp/pulse state so a remount starts clean. */
function makeScene(g: CanvasRenderingContext2D) {
  let W = 0;
  let H = 0;
  const cam = { pos: [0, 4, 11] as P3, tgt: [0, 0, 0] as P3, fov: 30 };
  const stamps: { x: number; z: number; t: number }[] = [];
  const pulses: { i: number; t: number; x: number; z: number }[] = [];
  let lastStamp = -1;
  let gridSlot = 0;

  function proj(p: P3) {
    const [cx, cy, cz] = cam.pos;
    const [tx, ty, tz] = cam.tgt;
    let fx = tx - cx;
    let fy = ty - cy;
    let fz = tz - cz;
    const fl = Math.hypot(fx, fy, fz);
    fx /= fl;
    fy /= fl;
    fz /= fl;
    let rx = fz;
    const ry = 0;
    let rz = -fx;
    const rl = Math.hypot(rx, rz) || 1;
    rx /= rl;
    rz /= rl;
    const ux = rz * fy - ry * fz;
    const uy = rx * fz - rz * fx;
    const uz = ry * fx - rx * fy;
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const dz = p[2] - cz;
    const x = dx * rx + dy * ry + dz * rz;
    const y = dx * ux + dy * uy + dz * uz;
    const z = dx * fx + dy * fy + dz * fz;
    // Fit both axes: the vertical fov is the camera's, the horizontal one is capped so a column-shaped canvas keeps
    // the whole ring in frame (the iframe was a wide banner; the native scene sits beside the text).
    const fv = H / 2 / Math.tan((cam.fov * Math.PI) / 360);
    const fh = W / 2 / Math.tan((HFOV * Math.PI) / 360);
    const f = Math.min(fv, fh);
    return { x: W / 2 + (x / z) * f, y: H / 2 - (y / z) * f, z, s: f / z };
  }
  function poly(pts: P3[], fill?: string, stroke?: string, lw?: number) {
    g.beginPath();
    pts.forEach((p, i) => {
      const q = proj(p);
      if (i) g.lineTo(q.x, q.y);
      else g.moveTo(q.x, q.y);
    });
    g.closePath();
    if (fill) {
      g.fillStyle = fill;
      g.fill();
    }
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = lw || 1;
      g.stroke();
    }
  }
  function line(pts: P3[], stroke: string, lw: number, dash?: number[]) {
    g.beginPath();
    pts.forEach((p, i) => {
      const q = proj(p);
      if (i) g.lineTo(q.x, q.y);
      else g.moveTo(q.x, q.y);
    });
    g.strokeStyle = stroke;
    g.lineWidth = lw;
    g.setLineDash(dash || []);
    g.stroke();
    g.setLineDash([]);
  }
  function dot(p: P3, r: number, fill: string, glow?: string) {
    const q = proj(p);
    if (q.z <= 0) return;
    if (glow) {
      g.shadowColor = glow;
      g.shadowBlur = (10 * q.s) / 60;
    }
    g.beginPath();
    g.arc(q.x, q.y, Math.max(0, r * q.s), 0, Math.PI * 2);
    g.fillStyle = fill;
    g.fill();
    g.shadowBlur = 0;
  }
  function box(c: P3, s: number, fill: string, edge: string) {
    const [x, y, z] = c;
    const h = s / 2;
    const V: P3[] = (
      [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ] as P3[]
    ).map((v) => [x + v[0] * h, y + v[1] * h, z + v[2] * h] as P3);
    const F = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [1, 2, 6, 5],
      [0, 3, 7, 4],
    ];
    const faces = F.map((f) => {
      const pts = f.map((i) => V[i]);
      const cz = pts.reduce((a, p) => a + proj(p).z, 0) / 4;
      return { pts, cz };
    }).sort((a, b) => b.cz - a.cz);
    faces.forEach((f, i) => {
      const shade = i < 3 ? 0 : 1;
      poly(f.pts, shade ? fill : mix(fill, "#000", 0.12), edge, 1);
    });
  }
  function text(p: P3, str: string, color: string, size: number, align?: CanvasTextAlign) {
    const q = proj(p);
    if (q.z <= 0) return;
    g.font = Math.min(13, Math.max(9, (size * q.s) / 70)) + 'px "JetBrains Mono", ui-monospace, monospace';
    g.fillStyle = color;
    g.textAlign = align || "center";
    g.fillText(str, q.x, q.y);
  }
  function shadow(c: { x: number; z: number }, r: number) {
    const q = proj([c.x, -1.19, c.z]);
    if (q.z <= 0) return;
    g.beginPath();
    g.ellipse(q.x, q.y, Math.max(0, r * q.s), Math.max(0, r * q.s * 0.35), 0, 0, Math.PI * 2);
    g.fillStyle = c.x * SX < 0 ? "rgba(94,230,194,.28)" : "rgba(20,21,27,.22)";
    g.fill();
  }
  const fogA = (z: number) => Math.max(0.55, Math.min(1, 1 - (z - 16) / 16));

  function draw(t: number, w: number, h: number) {
    W = w;
    H = h;
    const dz = Math.sin(t * 0.07) * 1.2;
    cam.pos = [4 + Math.sin(t * 0.05) * 2, 8.5, 18 + dz];
    cam.tgt = [1.6, -0.9, 0];
    cam.fov = 28;
    // floor halves: day paper, night ink
    const half = (sign: number, col: string) => {
      const pts: P3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = -Math.PI / 2 + (i / 64) * Math.PI;
        pts.push([Math.cos(a) * 10 * sign, -1.2, Math.sin(a) * 10]);
      }
      poly(pts, col);
    };
    half(1, "#E3E5EC");
    half(-1, INK);
    // ledger grid on the night floor (faint)
    for (let gx = -9; gx < 0; gx += 1) {
      line([[gx, -1.195, -Math.sqrt(100 - gx * gx) * 0.98], [gx, -1.195, Math.sqrt(100 - gx * gx) * 0.98]], "rgba(233,235,242,.09)", 1);
    }
    for (let gz = -9; gz <= 9; gz += 1) {
      const xe = -Math.sqrt(Math.max(0, 100 - gz * gz)) * 0.98;
      line([[xe, -1.195, gz], [-0.05, -1.195, gz]], "rgba(233,235,242,.09)", 1);
    }
    // meridian + clocks
    line([[0, -1.19, -10], [0, -1.19, 10]], "#5E6375", 1.5);
    line([[0, -1.19, -RAD - 1.2], [0, 1.2, -RAD - 1.2]], "rgba(139,144,163,.6)", 1, [3, 3]);
    // the projected clock labels have no screen bound: on a narrow canvas they reach the edge, so >= 480 only
    if (W >= 480) {
      text([0, 1.5, -RAD - 1.2], "16:00 ET · close", "#5E6375", 11);
      text([0, -1.5, RAD + 1.6], "09:30 ET · open", "#5E6375", 11);
    }
    // the night-side label does not name Bell
    text([5, -1.1, -8.6], "cash market · quoting", LAV, 10);
    text([-5, -1.1, -8.6], "closed · recording", MINT_L, 10);
    // cash tape (day side) with moving quote ticks
    const tape: P3[] = [];
    for (let i = 0; i <= 80; i++) {
      const a = -Math.PI * 0.44 + (i / 80) * Math.PI * 0.88;
      tape.push([Math.cos(a) * (RAD + 0.9) * SX, -1.1, -Math.sin(a) * (RAD + 0.9)]);
    }
    line(tape, LAV, 4);
    for (let k = 0; k < 14; k++) {
      const u = (k / 14 + t * 0.05) % 1;
      const a = -Math.PI * 0.44 + u * Math.PI * 0.88;
      const r0 = RAD + 0.75;
      const r1 = RAD + 1.05;
      line([[Math.cos(a) * r0 * SX, -1.1, -Math.sin(a) * r0], [Math.cos(a) * r1 * SX, -1.1, -Math.sin(a) * r1]], LAV_L, 2);
    }
    // cubes
    const cubes: { x: number; y: number; z: number; i: number; a: number }[] = [];
    for (let i = 0; i < N; i++) {
      const u = (i / N + t * 0.03) % 1;
      const a = u * Math.PI * 2;
      const x = Math.cos(a) * RAD;
      const z = Math.sin(a) * RAD;
      cubes.push({ x: x * SX, y: -0.62 + Math.sin(t * 1.5 + i) * 0.05, z, i, a });
    }
    // crossing pulses (day -> night at the meridian)
    cubes.forEach((c) => {
      if (c.x * SX < 0 && c.x * SX > -0.25 && c.z < 0 && !pulses.some((p) => p.i === c.i && t - p.t < 2)) pulses.push({ i: c.i, t, x: c.x, z: c.z });
    });
    while (pulses.length && t - pulses[0].t > 2) pulses.shift();
    pulses.forEach((p) => {
      const age = t - p.t;
      const r = 0.3 + age * 1.2;
      const pts: P3[] = [];
      for (let k = 0; k <= 40; k++) {
        const a = (k / 40) * Math.PI * 2;
        pts.push([p.x + Math.cos(a) * r, -1.18, p.z + Math.sin(a) * r]);
      }
      g.globalAlpha = (1 - age / 2) * 0.7;
      line(pts, MINT_L, 1.2);
      g.globalAlpha = 1;
    });
    // stamp ledger dots into grid cells
    const k = Math.floor(t / 0.28);
    if (k !== lastStamp) {
      lastStamp = k;
      const slot = gridSlot++;
      const col = -1 - (slot % 7);
      const row = (Math.floor(slot / 7) % 9) - 4;
      stamps.push({ x: (col - 0.5 + 0.15 * Math.sin(slot)) * SX, z: row + 0.3 * Math.cos(slot * 1.7), t });
      if (stamps.length > 63) stamps.shift();
    }
    stamps.forEach((s, idx) => {
      const age = t - s.t;
      const sc = Math.max(0, Math.min(1, age * 4));
      const fade = idx / stamps.length;
      dot([s.x, -1.18, s.z], 0.07 * sc, fade > 0.1 ? MINT_L : "#FFFFFF", MINT_L);
      if (age < 0.5) line([[s.x, -1.18, s.z], [s.x, -1.18 + (1 - age * 2) * 0.9, s.z]], "rgba(94,230,194," + (1 - age * 2) + ")", 1);
    });
    // shadows then cubes back-to-front
    cubes.forEach((c) => shadow(c, 0.4));
    cubes
      .sort((a, b) => proj([b.x, b.y, b.z]).z - proj([a.x, a.y, a.z]).z)
      .forEach((c) => {
        const night = Math.min(1, Math.max(0, (c.x * SX + 0.6) / 1.2));
        const q = proj([c.x, c.y, c.z]);
        g.globalAlpha = fogA(q.z);
        const fill = night > 0.5 ? mix("#D9F7EE", MINT_L, night * 0.85) : "#FFFFFF";
        if (night > 0.5) {
          g.shadowColor = MINT_L;
          g.shadowBlur = 22 * night;
        }
        box([c.x, c.y, c.z], 0.58, fill, night > 0.5 ? MINT : "#5E6375");
        g.shadowBlur = 0;
        if (c.i % 4 === 0) text([c.x, c.y + 0.75, c.z], TICK[((c.i / 4) | 0) % TICK.length], night > 0.5 ? MINT_L : "#3C4053", 10);
        g.globalAlpha = 1;
      });
  }
  return { draw };
}

export function BellScene({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const scene = makeScene(g);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = false;
    // The scene clock only advances while drawing: pausing off-screen freezes it, so a return resumes where it left.
    let clock = 0;
    let last = 0;

    const fit = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr;
      cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (last) clock += Math.min(0.1, (now - last) / 1000);
      last = now;
      g.clearRect(0, 0, W, H);
      try {
        scene.draw(reduced ? 8 : clock, W, H);
      } catch (e) {
        console.warn(e);
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    fit();
    const ro = new ResizeObserver(() => {
      fit();
      if (reduced || !raf) {
        // redraw one frame so a resize never leaves the canvas blank
        g.clearRect(0, 0, W, H);
        scene.draw(reduced ? 8 : clock, W, H);
      }
    });
    ro.observe(cv);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(cv);
    const onVis = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
