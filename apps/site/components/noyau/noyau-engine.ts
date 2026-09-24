// apps/site/components/noyau/noyau-engine.ts
// The MONARK "noyau": a two-faced sphere, two crossing orbits the built agents travel between, and a dashed
// ring for the upcoming agents. Dependency-free, no WebGL: two 2D canvases (behind / in front of the sphere)
// plus DOM beads that carry the real marks, positioned every frame. Decorative motion only: the canvases
// draw no text, no numbers, no claims. Honours reduced motion (a still frame, still draggable).
// Investor delivery of 2026-09-23 (see COMPONENTS-PROVENANCE.md); adapted for the site: the group of an agent
// IS its fleet-register status word (lib/fleet.ts FleetStatus), passed through unchanged by noyau.tsx.

export type ThemeName = "light" | "dark";
export type AgentGroup = "built" | "upcoming";

export interface AgentSpec {
  id: string;
  name: string;
  accent: string;
  group: AgentGroup;
}

export interface Palette {
  ink: string;
  paper: string;
  ia: string;
  defi: string;
  sph0: string;
  sph1: string;
}

export interface NoyauEngineOptions {
  root: HTMLElement;
  back: HTMLCanvasElement;
  front: HTMLCanvasElement;
  beads: Record<string, HTMLElement | null>;
  labels: Record<string, HTMLElement | null>;
  agents: readonly AgentSpec[];
  palette: (theme: ThemeName) => Palette;
  theme: ThemeName;
  reducedMotion: boolean;
  speed?: number;
  /** Pixels kept free at the bottom (legend). */
  reserveBottom?: number;
}

type RGB = readonly [number, number, number];
type V3 = readonly [number, number, number];
type P4 = readonly [number, number, number, number];
type Box = readonly [number, number, number, number];
type M3 = readonly [number, number, number, number, number, number, number, number, number];
interface RGBPalette {
  ink: RGB;
  paper: RGB;
  ia: RGB;
  defi: RGB;
  sph0: RGB;
  sph1: RGB;
}

const TAU = Math.PI * 2;
const RR = 1.3;
const RG = 1.78;
const F = 8;
const GZ = Math.cos(0.3);
const GS = Math.sin(0.3);

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const smooth = (x: number): number => x * x * (3 - 2 * x);

function parseColor(c: string): RGB {
  const s = c.trim();
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    const n = parseInt(hex.slice(0, 6), 16);
    if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = /rgba?\(([^)]+)\)/.exec(s);
  if (m?.[1]) {
    const [r = 128, g = 128, b = 128] = m[1].split(",").map((x) => parseFloat(x));
    return [r, g, b];
  }
  return [128, 128, 128];
}

const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a: number): string =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp01(a).toFixed(3)})`;

function rotX(a: number): M3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}
function rotY(a: number): M3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}
function rotZ(a: number): M3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}
function mul(A: M3, B: M3): M3 {
  const [a0, a1, a2, a3, a4, a5, a6, a7, a8] = A;
  const [b0, b1, b2, b3, b4, b5, b6, b7, b8] = B;
  return [
    a0 * b0 + a1 * b3 + a2 * b6, a0 * b1 + a1 * b4 + a2 * b7, a0 * b2 + a1 * b5 + a2 * b8,
    a3 * b0 + a4 * b3 + a5 * b6, a3 * b1 + a4 * b4 + a5 * b7, a3 * b2 + a4 * b5 + a5 * b8,
    a6 * b0 + a7 * b3 + a8 * b6, a6 * b1 + a7 * b4 + a8 * b7, a6 * b2 + a7 * b5 + a8 * b8,
  ];
}
function ap(M: M3, p: V3): V3 {
  const [m0, m1, m2, m3, m4, m5, m6, m7, m8] = M;
  return [m0 * p[0] + m1 * p[1] + m2 * p[2], m3 * p[0] + m4 * p[1] + m5 * p[2], m6 * p[0] + m7 * p[1] + m8 * p[2]];
}
const overlap = (a: Box, b: Box): boolean => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

function toRGB(p: Palette): RGBPalette {
  return { ink: parseColor(p.ink), paper: parseColor(p.paper), ia: parseColor(p.ia), defi: parseColor(p.defi), sph0: parseColor(p.sph0), sph1: parseColor(p.sph1) };
}

/** Reads the site's own tokens (app/globals.css), so the noyau follows `.dark` like everything else. */
export function readSitePalette(theme: ThemeName): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string): string => cs.getPropertyValue(name).trim() || fallback;
  const dark = theme === "dark";
  return {
    ink: v("--ink", dark ? "#f2ede4" : "#1f1b16"),
    paper: v("--paper", dark ? "#15120f" : "#faf7f2"),
    ia: v("--hikae-t", dark ? "#3fbfb1" : "#12857a"),
    defi: v("--defer", dark ? "#c9a56a" : "#8a6d3b"),
    sph0: dark ? "#1d2026" : v("--card", "#fffdf9"),
    sph1: dark ? "#0c0d10" : v("--soft-active", "#e8e1d5"),
  };
}

interface Item {
  a: AgentSpec;
  p: P4;
  dn: number;
  order: number;
}

export class NoyauEngine {
  private readonly o: NoyauEngineOptions;
  private readonly bctx: CanvasRenderingContext2D;
  private readonly fctx: CanvasRenderingContext2D;
  private readonly ro: ResizeObserver;
  private readonly io: IntersectionObserver;
  private readonly sphere: V3[] = [];
  private readonly pA: number[];
  private readonly pB: number[];
  private readonly accents = new Map<string, RGB>();
  private readonly sizes = new Map<HTMLElement, readonly [number, number]>();
  private readonly behind = new Map<HTMLElement, boolean>();
  private w = 1;
  private h = 1;
  private dpr = 1;
  private S = 1;
  private t = 0;
  private intro = 0;
  private yaw = 0;
  private pitch = 0;
  private vy = 0;
  private drag: { x: number; y: number } | null = null;
  private from: RGBPalette;
  private to: RGBPalette;
  private mix = 1;
  private raf = 0;
  private last = 0;
  private visible = true;

  constructor(options: NoyauEngineOptions) {
    this.o = { ...options };
    const b = options.back.getContext("2d");
    const f = options.front.getContext("2d");
    if (!b || !f) throw new Error("2D canvas unavailable");
    this.bctx = b;
    this.fctx = f;
    this.to = toRGB(options.palette(options.theme));
    this.from = this.to;
    for (const a of options.agents) this.accents.set(a.id, parseColor(a.accent));
    for (let i = 0, n = 760; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963229728653;
      this.sphere.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    let seed = 11;
    const rnd = (): number => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const packets = (n: number): number[] => {
      const out: number[] = [];
      while (out.length < n) {
        const base = rnd() * TAU, cnt = 3 + Math.floor(rnd() * 6);
        for (let j = 0; j < cnt && out.length < n; j++) out.push(base + j * 0.035);
      }
      return out;
    };
    this.pA = packets(80);
    this.pB = packets(80);
    const root = options.root;
    root.addEventListener("pointerdown", this.onDown);
    root.addEventListener("pointermove", this.onMove);
    root.addEventListener("pointerup", this.onUp);
    root.addEventListener("pointercancel", this.onUp);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(root);
    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) this.visible = e.isIntersecting;
    });
    this.io.observe(root);
    void document.fonts.ready.then(() => this.sizes.clear());
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  setTheme(theme: ThemeName): void {
    const now = this.current();
    this.to = toRGB(this.o.palette(theme));
    this.from = now;
    this.mix = this.o.reducedMotion || this.intro < 0.2 ? 1 : 0;
  }

  setReducedMotion(value: boolean): void {
    this.o.reducedMotion = value;
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    const root = this.o.root;
    root.removeEventListener("pointerdown", this.onDown);
    root.removeEventListener("pointermove", this.onMove);
    root.removeEventListener("pointerup", this.onUp);
    root.removeEventListener("pointercancel", this.onUp);
  }

  private readonly onDown = (e: PointerEvent): void => {
    this.drag = { x: e.clientX, y: e.clientY };
    this.vy = 0;
    try {
      this.o.root.setPointerCapture(e.pointerId);
    } catch {
      // capture is best-effort
    }
    this.o.root.style.cursor = "grabbing";
  };

  private readonly onMove = (e: PointerEvent): void => {
    if (!this.drag) return;
    const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
    this.drag = { x: e.clientX, y: e.clientY };
    this.vy = dx * 0.006;
    this.yaw += this.vy;
    this.pitch = Math.max(-0.7, Math.min(0.7, this.pitch + dy * 0.005));
  };

  private readonly onUp = (): void => {
    this.drag = null;
    this.o.root.style.cursor = "grab";
  };

  private readonly frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60;
    this.last = now;
    if (!this.visible || document.hidden) return;
    this.tick(dt);
  };

  private current(): RGBPalette {
    const k = smooth(this.mix), a = this.from, b = this.to;
    return { ink: mixc(a.ink, b.ink, k), paper: mixc(a.paper, b.paper, k), ia: mixc(a.ia, b.ia, k), defi: mixc(a.defi, b.defi, k), sph0: mixc(a.sph0, b.sph0, k), sph1: mixc(a.sph1, b.sph1, k) };
  }

  private resize(): void {
    const { root, back, front, agents, beads } = this.o;
    const w = Math.max(1, root.clientWidth), h = Math.max(1, root.clientHeight), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    for (const c of [back, front]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const reserve = this.o.reserveBottom ?? 0;
    // Optional width-relative cap, read from the CSS custom property --noyau-span on the container (unset or 0 = no
    // cap): the outer ring's largest projected radius, RG * S * F / (F - RG), stays within span * w / 2, so the beads
    // and their labels keep inside the opaque part of the edge mask. The site sets it on the desktop hero only.
    const span = parseFloat(getComputedStyle(root).getPropertyValue("--noyau-span"));
    const cap = span > 0 ? (span * w) / 2 / ((RG * F) / (F - RG)) : Infinity;
    this.S = Math.max(24, Math.min((w / 2 - 48) / RG, (h / 2 - 34 - reserve / 2) / (RG * 0.8), cap));
    for (const a of agents) {
      const el = beads[a.id];
      if (!el) continue;
      const d = 2 * this.S * (a.group === "built" ? 0.115 : 0.085);
      el.style.width = `${d.toFixed(1)}px`;
      el.style.height = `${d.toFixed(1)}px`;
    }
    this.sizes.clear();
  }

  private tick(dt: number): void {
    const o = this.o, w = this.w, h = this.h, dpr = this.dpr, S = this.S;
    if (!o.reducedMotion) this.t += dt * (o.speed ?? 1);
    this.intro = o.reducedMotion ? 1 : Math.min(1, this.intro + dt / 2.6);
    this.mix = o.reducedMotion ? 1 : Math.min(1, this.mix + dt / 0.45);
    if (!this.drag) {
      this.yaw += this.vy;
      this.vy *= 0.95;
      this.pitch *= 0.985;
    }
    const t = this.t, pal = this.current(), intro = this.intro;
    const G = mul(rotX(0.42 + this.pitch), mul(rotY(t * 0.12 + this.yaw), rotZ(0.2)));
    const al = 0.72 + 0.1 * Math.sin(t * 0.3), ca = Math.cos(al), sa = Math.sin(al);
    const rA = (ph: number): V3 => [RR * Math.cos(ph), RR * Math.sin(ph) * ca, RR * Math.sin(ph) * sa];
    const rB = (ph: number): V3 => [RR * Math.cos(ph), RR * Math.sin(ph) * ca, -RR * Math.sin(ph) * sa];
    const rG = (ph: number): V3 => {
      const x = RG * Math.cos(ph);
      return [x * GZ, x * GS, RG * Math.sin(ph)];
    };
    const cx = w / 2, cy = h / 2 - (o.reserveBottom ?? 0) / 2;
    const P = (p: V3): P4 => {
      const q = ap(G, p), k = F / (F - q[2]);
      return [cx + q[0] * S * k, cy - q[1] * S * k, q[2], k];
    };
    const bc = this.bctx, fc = this.fctx;
    bc.setTransform(dpr, 0, 0, dpr, 0, 0);
    bc.clearRect(0, 0, w, h);
    fc.setTransform(dpr, 0, 0, dpr, 0, 0);
    fc.clearRect(0, 0, w, h);
    const reveal = smooth(clamp01(intro / 0.5)), partA = clamp01((intro - 0.35) / 0.35);

    const items: Item[] = [];
    const built = o.agents.filter((a) => a.group === "built");
    const named = o.agents.filter((a) => a.group === "upcoming");
    built.forEach((a, k) => {
      const s = (((t * 0.06 + (k * 2) / built.length) % 2) + 2) % 2;
      items.push({ a, p: P(s < 1 ? rA(Math.PI * s) : rB(Math.PI * s)), dn: Math.min(Math.abs(s - 1), Math.min(s, 2 - s)), order: items.length });
    });
    named.forEach((a, j) => {
      items.push({ a, p: P(rG(t * 0.04 + (j / named.length) * TAU + 0.4)), dn: 1, order: items.length });
    });

    // Sphere (front canvas, drawn first so the front orbits pass over it).
    const c0 = P([0, 0, 0]), rc = 0.5 * S * c0[3];
    fc.globalAlpha = clamp01(intro / 0.4);
    const dg = fc.createRadialGradient(c0[0] - rc * 0.35, c0[1] - rc * 0.4, rc * 0.1, c0[0], c0[1], rc * 1.05);
    dg.addColorStop(0, rgba(pal.sph0, 1));
    dg.addColorStop(1, rgba(pal.sph1, 1));
    fc.fillStyle = dg;
    fc.beginPath();
    fc.arc(c0[0], c0[1], rc * 1.02, 0, TAU);
    fc.fill();
    for (const sp of this.sphere) {
      const q = ap(G, sp);
      if (q[2] < 0) continue;
      const x = c0[0] + q[0] * rc, y = c0[1] - q[1] * rc, lit = 0.2 + 0.8 * q[2];
      if (sp[2] >= 0) {
        fc.fillStyle = rgba(pal.ia, lit * 0.95);
        fc.beginPath();
        fc.arc(x, y, 1.15, 0, TAU);
        fc.fill();
      } else {
        fc.fillStyle = rgba(pal.defi, lit * 0.95);
        fc.fillRect(x - 1.05, y - 1.05, 2.1, 2.1);
      }
    }
    fc.strokeStyle = rgba(pal.ink, 0.55);
    fc.lineWidth = 1;
    fc.beginPath();
    let started = false;
    for (let i = 0; i <= 96; i++) {
      const ph = (i / 96) * TAU, q = ap(G, [Math.cos(ph), Math.sin(ph), 0]);
      if (q[2] < 0) {
        started = false;
        continue;
      }
      const x = c0[0] + q[0] * rc, y = c0[1] - q[1] * rc;
      if (!started) {
        fc.moveTo(x, y);
        started = true;
      } else fc.lineTo(x, y);
    }
    fc.stroke();
    fc.strokeStyle = rgba(pal.ink, 0.12);
    fc.beginPath();
    fc.arc(c0[0], c0[1], rc, 0, TAU);
    fc.stroke();
    fc.globalAlpha = 1;

    // Orbits: each segment goes to the canvas of its side; the back canvas is blurred by CSS.
    const ring = (fn: (ph: number) => V3, col: RGB, dashed: boolean, baseA: number): void => {
      const NN = 160, lim = Math.floor(NN * reveal);
      let prev = P(fn(0));
      for (let i = 1; i <= lim; i++) {
        const cur = P(fn((i / NN) * TAU)), z = (prev[2] + cur[2]) / 2;
        if (!dashed || (i >> 1) % 2 === 0) {
          const c = z >= 0 ? fc : bc, dep = clamp01((z / RG + 1) / 2);
          c.strokeStyle = rgba(col, baseA * (0.2 + 0.8 * dep));
          c.lineWidth = 0.8 + 1.1 * dep;
          c.beginPath();
          c.moveTo(prev[0], prev[1]);
          c.lineTo(cur[0], cur[1]);
          c.stroke();
        }
        prev = cur;
      }
    };
    ring(rG, pal.ink, true, 0.3);
    ring(rA, pal.ia, false, 0.9);
    ring(rB, pal.defi, false, 0.9);

    const parts = (fn: (ph: number) => V3, list: number[], dir: number, col: RGB, square: boolean): void => {
      if (partA <= 0) return;
      for (const ph of list) {
        const p = P(fn(ph + dir * t * 0.35)), c = p[2] >= 0 ? fc : bc, dep = clamp01((p[2] / RR + 1) / 2), s = (1.1 + 1.4 * dep) * p[3];
        c.fillStyle = rgba(col, (0.25 + 0.7 * dep) * partA);
        if (square) c.fillRect(p[0] - s, p[1] - s, 2 * s, 2 * s);
        else {
          c.beginPath();
          c.arc(p[0], p[1], s, 0, TAU);
          c.fill();
        }
      }
    };
    parts(rA, this.pA, 1, pal.ia, false);
    parts(rB, this.pB, -1, pal.defi, true);

    // Crossing points, and the thin link from an agent passing a crossing to the sphere.
    for (const node of [P([RR, 0, 0]), P([-RR, 0, 0])]) {
      const c = node[2] >= 0 ? fc : bc, dep = clamp01((node[2] / RR + 1) / 2);
      c.fillStyle = rgba(pal.ink, (0.3 + 0.6 * dep) * partA);
      c.beginPath();
      c.arc(node[0], node[1], 2, 0, TAU);
      c.fill();
    }
    if (intro >= 1) {
      for (const it of items) {
        if (it.a.group !== "built" || it.dn >= 0.09) continue;
        const f = 1 - it.dn / 0.09, c = it.p[2] >= 0 ? fc : bc, acc = this.accents.get(it.a.id) ?? pal.ink;
        const dx = it.p[0] - c0[0], dy = it.p[1] - c0[1], len = Math.hypot(dx, dy) || 1;
        const ex = c0[0] + (dx / len) * rc, ey = c0[1] + (dy / len) * rc;
        c.strokeStyle = rgba(acc, 0.7 * f);
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(it.p[0], it.p[1]);
        c.lineTo(ex, ey);
        c.stroke();
        c.fillStyle = rgba(acc, 0.9 * f);
        c.beginPath();
        c.arc(ex, ey, 2.2, 0, TAU);
        c.fill();
      }
    }

    // DOM beads: behind the sphere they sit under the front canvas, blurred and dimmed.
    const boxes: Box[] = [[c0[0] - rc, c0[1] - rc, 2 * rc, 2 * rc]];
    const reqs: { el: HTMLElement; x: number; y: number; gap: number; side: number; alpha: number; prio: number }[] = [];
    for (const it of items) {
      const isBuilt = it.a.group === "built";
      const r = S * (isBuilt ? 0.115 : 0.085);
      const appear = smooth(clamp01((intro - (isBuilt ? 0.5 : 0.62) - it.order * 0.03) / 0.3));
      const dep = clamp01((it.p[2] / (isBuilt ? RR : RG) + 1) / 2);
      const isBehind = it.p[2] < 0;
      const el = o.beads[it.a.id];
      if (el) {
        if (this.behind.get(el) !== isBehind) {
          this.behind.set(el, isBehind);
          el.style.zIndex = isBehind ? "2" : "4";
          el.style.filter = isBehind ? "blur(1.1px)" : "none";
        }
        el.style.opacity = (appear * (isBuilt ? 0.5 + 0.5 * dep : 0.35 + 0.55 * dep)).toFixed(3);
        el.style.transform = `translate3d(${(it.p[0] - r).toFixed(1)}px,${(it.p[1] - r).toFixed(1)}px,0) scale(${(it.p[3] * (0.6 + 0.4 * appear)).toFixed(3)})`;
      }
      if (isBuilt && !isBehind) boxes.push([it.p[0] - r, it.p[1] - r, 2 * r, 2 * r]);
      const lab = o.labels[it.a.id];
      if (!lab) continue;
      const shown = isBuilt || it.p[2] > -0.25;
      reqs.push({ el: lab, x: it.p[0], y: it.p[1], gap: r * it.p[3] + 7, side: it.p[0] >= cx ? 1 : -1, alpha: shown ? appear * (isBuilt ? 0.45 + 0.55 * dep : 0.35 + 0.6 * dep) : 0, prio: (isBuilt ? 3 : 1) + dep });
    }
    reqs.sort((a, b) => b.prio - a.prio);
    const bottom = h - 8 - (o.reserveBottom ?? 0);
    for (const q of reqs) {
      if (q.alpha <= 0.01) {
        q.el.style.opacity = "0";
        continue;
      }
      let m = this.sizes.get(q.el);
      if (!m || !m[0]) {
        m = [q.el.offsetWidth, q.el.offsetHeight];
        this.sizes.set(q.el, m);
      }
      const [ew, eh] = m;
      let spot: readonly [number, number] | null = null;
      for (const dy of [0, -14, 14, -28, 28]) {
        let x = q.side > 0 ? q.x + q.gap : q.x - q.gap - ew;
        if (x + ew > w - 8) x = q.x - q.gap - ew;
        if (x < 8) x = q.x + q.gap;
        x = Math.max(8, Math.min(w - ew - 8, x));
        const y = Math.max(8, Math.min(bottom - eh, q.y + dy - eh / 2));
        const box: Box = [x - 3, y, ew + 6, eh];
        if (!boxes.some((b) => overlap(b, box))) {
          spot = [x, y];
          boxes.push(box);
          break;
        }
      }
      if (!spot) {
        q.el.style.opacity = "0";
        continue;
      }
      q.el.style.transform = `translate3d(${spot[0].toFixed(1)}px,${spot[1].toFixed(1)}px,0)`;
      q.el.style.opacity = q.alpha.toFixed(3);
    }
  }
}
