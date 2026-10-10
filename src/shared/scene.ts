/**
 * Mawsim festive scene — an interactive, pseudo-3D canvas background.
 *
 * Kinds:
 *  - ramadan        swinging fanous lanterns, glowing crescent, twinkling stars
 *  - snow           falling 3D-shaded snowballs
 *  - ramadan-snow   both together
 *  - confetti       flipping confetti (sales, celebrations)
 *  - stars          falling golden stars and small crescents
 *
 * Interaction: lanterns sway when the pointer passes them and swing when tapped,
 * snow is blown away from the pointer, taps throw golden sparks, and everything
 * has depth parallax that follows the mouse or the phone's tilt.
 *
 * Performance: pauses when off-screen or the tab is hidden, caps pixel ratio,
 * scales particle counts with the area, and draws one still frame when the
 * visitor prefers reduced motion.
 */

export type SceneKind = 'none' | 'ramadan' | 'snow' | 'ramadan-snow' | 'confetti' | 'stars';

export interface SceneOptions {
  kind: SceneKind;
  /** 'section' = fills its parent; 'page' = fixed full-screen layer of falling items only */
  mode?: 'section' | 'page';
  /** 0.4 – 2, multiplies particle counts */
  density?: number;
  /** brand color used for some lantern glass and confetti */
  accent?: string;
  /** where to listen for pointer movement (defaults to the canvas parent / window for page mode) */
  pointerTarget?: HTMLElement | Window;
  /** start side for the crescent ('right' in Arabic) */
  rtl?: boolean;
  /** the scene sits on a light background (adds shadows to snow) */
  onLight?: boolean;
}

interface Lantern {
  ax: number; // anchor x (0..1)
  z: number; // depth 0 (near) .. 1 (far)
  len: number; // chain length in px at scale 1
  a: number; // angle (rad)
  w: number; // angular velocity
  glass: string;
  phase: number;
  flicker: number;
  boost: number;
}

interface Flake {
  x: number;
  y: number;
  z: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  vx: number;
  rot: number;
  vr: number;
  color: string;
  shape: 0 | 1 | 2; // 0 ball/star dot, 1 confetti, 2 crescent
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  r: number;
  p: number;
}

const GOLD_LIGHT = '#f6d27a';
const GOLD = '#d9a441';
const GOLD_DARK = '#9c6b1f';

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class FestiveScene {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private t = 0;
  private visible = true;
  private running = false;
  private destroyed = false;

  private lanterns: Lantern[] = [];
  private flakes: Flake[] = [];
  private sparks: Spark[] = [];
  private stars: Star[] = [];

  // pointer state in canvas px
  private px = -9999;
  private py = -9999;
  private pvx = 0;
  private pvy = 0;
  // parallax (-1..1), smoothed
  private tx = 0;
  private ty = 0;
  private sx = 0;
  private sy = 0;

  private ro?: ResizeObserver;
  private io?: IntersectionObserver;
  private cleanup: Array<() => void> = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: SceneOptions,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.opts = { mode: 'section', density: 1, accent: '#0f766e', rtl: true, ...opts };
    this.bind();
    this.resize();
    if (reduceMotion()) {
      // still image: place everything and draw a single frame
      this.step(0);
      this.draw();
    } else {
      this.start();
    }
  }

  /** Change kind/accent/density without recreating the canvas. */
  update(opts: Partial<SceneOptions>) {
    Object.assign(this.opts, opts);
    this.populate();
    if (reduceMotion()) this.draw();
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    this.cleanup.forEach((f) => f());
    this.ro?.disconnect();
    this.io?.disconnect();
  }

  // ------------------------------------------------------------------ lifecycle
  private start() {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      if (this.visible && !document.hidden) {
        this.step(dt);
        this.draw();
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private bind() {
    const page = this.opts.mode === 'page';
    const target: HTMLElement | Window =
      this.opts.pointerTarget || (page ? window : (this.canvas.parentElement as HTMLElement) || window);

    const toLocal = (cx: number, cy: number) => {
      const r = this.canvas.getBoundingClientRect();
      return { x: cx - r.left, y: cy - r.top, r };
    };

    const onMove = (e: PointerEvent) => {
      const { x, y, r } = toLocal(e.clientX, e.clientY);
      if (this.px > -9000) {
        this.pvx = this.pvx * 0.5 + (x - this.px) * 0.5;
        this.pvy = this.pvy * 0.5 + (y - this.py) * 0.5;
      }
      this.px = x;
      this.py = y;
      this.tx = Math.max(-1, Math.min(1, (x / Math.max(1, r.width)) * 2 - 1));
      this.ty = Math.max(-1, Math.min(1, (y / Math.max(1, r.height)) * 2 - 1));
      this.nudgeLanterns();
    };
    const onLeave = () => {
      this.px = this.py = -9999;
      this.pvx = this.pvy = 0;
      this.tx = this.ty = 0;
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = toLocal(e.clientX, e.clientY);
      this.tap(x, y);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      this.tx = Math.max(-1, Math.min(1, e.gamma / 30));
      this.ty = Math.max(-1, Math.min(1, (e.beta - 40) / 30));
    };

    target.addEventListener('pointermove', onMove as EventListener, { passive: true });
    target.addEventListener('pointerleave', onLeave as EventListener, { passive: true });
    target.addEventListener('pointerdown', onDown as EventListener, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    this.cleanup.push(() => {
      target.removeEventListener('pointermove', onMove as EventListener);
      target.removeEventListener('pointerleave', onLeave as EventListener);
      target.removeEventListener('pointerdown', onDown as EventListener);
      window.removeEventListener('deviceorientation', onTilt);
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.canvas);
    } else {
      const r = () => this.resize();
      window.addEventListener('resize', r);
      this.cleanup.push(() => window.removeEventListener('resize', r));
    }
    if (typeof IntersectionObserver !== 'undefined' && !page) {
      this.io = new IntersectionObserver((entries) => {
        this.visible = entries.some((en) => en.isIntersecting);
      });
      this.io.observe(this.canvas);
    }
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    if (w === this.w && h === this.h) return;
    const first = this.w === 0;
    this.w = w;
    this.h = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, w < 600 ? 1.5 : 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (first || this.flakes.length === 0) this.populate();
    else this.layoutLanterns();
    if (reduceMotion()) this.draw();
  }

  // ------------------------------------------------------------------ content
  private has(part: 'lanterns' | 'snow' | 'confetti' | 'stars' | 'crescent') {
    const k = this.opts.kind;
    const page = this.opts.mode === 'page';
    switch (part) {
      case 'lanterns':
        return !page && (k === 'ramadan' || k === 'ramadan-snow');
      case 'crescent':
        return !page && (k === 'ramadan' || k === 'ramadan-snow');
      case 'snow':
        return k === 'snow' || k === 'ramadan-snow';
      case 'confetti':
        return k === 'confetti';
      case 'stars':
        return k === 'stars' || (page && k === 'ramadan');
    }
  }

  private palette(): string[] {
    const acc = this.opts.accent || '#0f766e';
    return [acc, GOLD, '#ffffff', '#ff6b81', '#60c6ff', '#f9d65c', '#8ef0c2'];
  }

  private populate() {
    this.layoutLanterns();
    this.flakes = [];
    this.stars = [];
    const area = (this.w * this.h) / (1280 * 700);
    const d = Math.max(0.4, Math.min(2, this.opts.density ?? 1));
    const mobile = this.w < 600;

    if (this.has('crescent')) {
      const n = Math.round(Math.min(90, 55 * area) * d);
      for (let i = 0; i < n; i++) {
        this.stars.push({ x: Math.random(), y: Math.random() * 0.75, r: rand(0.6, 1.8), p: rand(0, Math.PI * 2) });
      }
    }

    const add = (count: number, shape: Flake['shape'], colorFn: () => string, rMin: number, rMax: number) => {
      for (let i = 0; i < count; i++) {
        const z = Math.random();
        const near = 1 - z;
        this.flakes.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          z,
          r: rMin + (rMax - rMin) * near * near,
          vy: 18 + 70 * near,
          sway: rand(8, 26) * near,
          phase: rand(0, Math.PI * 2),
          vx: 0,
          rot: rand(0, Math.PI * 2),
          vr: rand(-3, 3),
          color: colorFn(),
          shape,
        });
      }
    };

    const base = Math.max(12, Math.min(mobile ? 70 : 150, 110 * area));
    if (this.has('snow')) add(Math.round(base * d), 0, () => '#ffffff', 1.4, mobile ? 6 : 8);
    if (this.has('confetti')) {
      const pal = this.palette();
      add(Math.round(base * 0.7 * d), 1, () => pal[Math.floor(Math.random() * pal.length)], 3, 7);
    }
    if (this.has('stars')) {
      add(Math.round(base * 0.45 * d), 0, () => GOLD_LIGHT, 1.2, 3.2);
      add(Math.round(base * 0.08 * d), 2, () => GOLD, 5, 10);
    }
    // sort far → near so near items draw on top
    this.flakes.sort((a, b) => b.z - a.z);
  }

  private layoutLanterns() {
    if (!this.has('lanterns')) {
      this.lanterns = [];
      return;
    }
    const acc = this.opts.accent || '#0f766e';
    const glasses = ['#ffb347', acc, '#ff5d73', '#4fd1c5', '#b794f4', '#ffd166'];
    const narrow = this.w < 640;
    const perSide: number = narrow ? 2 : this.w < 1000 ? 2 : 3;
    const xs: number[] = [];
    // lanterns live on the two sides so the middle stays clear for text
    const span = narrow ? 0.26 : 0.22;
    for (let i = 0; i < perSide; i++) {
      const f = perSide === 1 ? 0.5 : i / (perSide - 1);
      xs.push(0.04 + f * span);
      xs.push(0.96 - f * span);
    }
    const prev = this.lanterns;
    const maxLen = narrow ? Math.max(20, Math.min(this.h * 0.12, 70)) : Math.max(30, Math.min(this.h * 0.32, 220));
    this.lanterns = xs.map((ax, i) => {
      const old = prev[i];
      const z = [0.1, 0.55, 0.85, 0.3, 0.7, 0.2][i % 6];
      return {
        ax,
        z,
        len: old?.len ?? rand(maxLen * 0.25, maxLen),
        a: old?.a ?? rand(-0.08, 0.08),
        w: old?.w ?? 0,
        glass: old?.glass ?? glasses[i % glasses.length],
        phase: old?.phase ?? rand(0, Math.PI * 2),
        flicker: 1,
        boost: 0,
      };
    });
  }

  private scaleOf(z: number) {
    const s = this.w < 640 ? 0.55 : this.w < 1000 ? 0.75 : 0.95;
    return s * (0.55 + (1 - z) * 0.6);
  }

  /** Screen position of a lantern's glass centre. */
  private lanternCenter(l: Lantern) {
    const s = this.scaleOf(l.z);
    const ax = l.ax * this.w + this.sx * (1 - l.z) * 28;
    const ay = -6;
    const L = l.len * s + 60 * s;
    return { x: ax + Math.sin(l.a) * L, y: ay + Math.cos(l.a) * L, s };
  }

  private nudgeLanterns() {
    for (const l of this.lanterns) {
      const c = this.lanternCenter(l);
      const dx = this.px - c.x;
      const dy = this.py - c.y;
      const dist = Math.hypot(dx, dy);
      const reach = 70 * c.s + 20;
      if (dist < reach) {
        l.w += (this.pvx * 0.012 * (1 - dist / reach)) / Math.max(0.6, c.s);
        l.boost = Math.min(1, l.boost + 0.08);
      }
    }
  }

  private tap(x: number, y: number) {
    let hit = false;
    for (const l of this.lanterns) {
      const c = this.lanternCenter(l);
      if (Math.hypot(x - c.x, y - c.y) < 60 * c.s + 16) {
        l.w += (x < c.x ? 1 : -1) * rand(1.4, 2.2);
        l.boost = 1;
        this.burst(c.x, c.y, 34, [GOLD_LIGHT, '#fff3c4', l.glass]);
        hit = true;
      }
    }
    if (!hit) {
      const cols = this.has('confetti') ? this.palette() : [GOLD_LIGHT, '#ffffff', '#fff3c4'];
      this.burst(x, y, 22, cols);
    }
    // blow nearby snow / confetti outward
    for (const f of this.flakes) {
      const dx = f.x - x;
      const dy = f.y - y;
      const d = Math.hypot(dx, dy);
      if (d < 140) {
        const k = (1 - d / 140) * 260;
        f.vx += (dx / (d || 1)) * k;
        f.y += (dy / (d || 1)) * k * 0.05;
      }
    }
    if (reduceMotion()) this.draw();
  }

  private burst(x: number, y: number, n: number, colors: string[]) {
    if (reduceMotion()) return;
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(60, 260);
      this.sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0,
        max: rand(0.5, 1.1),
        r: rand(1.2, 3.2),
        color: colors[i % colors.length],
      });
    }
    if (this.sparks.length > 400) this.sparks.splice(0, this.sparks.length - 400);
  }

  // ------------------------------------------------------------------ simulation
  private step(dt: number) {
    this.t += dt;
    // smooth parallax
    this.sx += (this.tx - this.sx) * Math.min(1, dt * 4);
    this.sy += (this.ty - this.sy) * Math.min(1, dt * 4);
    this.pvx *= 0.9;
    this.pvy *= 0.9;

    for (const l of this.lanterns) {
      const k = 6 * (120 / (l.len + 60));
      const breeze = Math.sin(this.t * 0.8 + l.phase) * 0.06;
      const acc = -k * Math.sin(l.a) - 0.7 * l.w + breeze;
      l.w += acc * dt;
      l.a += l.w * dt;
      l.a = Math.max(-0.9, Math.min(0.9, l.a));
      l.boost = Math.max(0, l.boost - dt * 0.6);
      l.flicker = 0.88 + Math.sin(this.t * 9 + l.phase) * 0.05 + Math.sin(this.t * 23 + l.phase * 2) * 0.04;
    }

    const W = this.w;
    const H = this.h;
    for (const f of this.flakes) {
      const near = 1 - f.z;
      f.y += f.vy * dt;
      f.x += (Math.sin(this.t * 1.2 + f.phase) * f.sway + f.vx) * dt;
      f.vx *= 1 - Math.min(1, dt * 2.2);
      f.rot += f.vr * dt;
      // pointer wind
      if (this.px > -9000) {
        const dx = f.x - this.px;
        const dy = f.y - this.py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 110 * 110) {
          const d = Math.sqrt(d2) || 1;
          const push = (1 - d / 110) * 220 * (0.4 + near);
          f.vx += (dx / d) * push * dt * 6 + this.pvx * 0.6;
        }
      }
      if (f.y - f.r > H + 10) {
        f.y = -f.r - rand(0, 40);
        f.x = Math.random() * W;
        f.vx = 0;
      }
      if (f.x < -30) f.x = W + 20;
      if (f.x > W + 30) f.x = -20;
    }

    for (const s of this.sparks) {
      s.life += dt;
      s.vy += 240 * dt;
      s.vx *= 1 - dt * 1.5;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    this.sparks = this.sparks.filter((s) => s.life < s.max);
  }

  // ------------------------------------------------------------------ drawing
  private draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    if (this.has('crescent')) this.drawSky();

    // far flakes behind lanterns, near flakes in front
    const split = this.flakes.findIndex((f) => f.z < 0.45);
    const far = split === -1 ? this.flakes : this.flakes.slice(0, split);
    const near = split === -1 ? [] : this.flakes.slice(split);

    this.drawFlakes(far);
    // far lanterns first
    [...this.lanterns].sort((a, b) => b.z - a.z).forEach((l) => this.drawLantern(l));
    this.drawFlakes(near);
    this.drawSparks();
  }

  private drawSky() {
    const { ctx, w, h } = this;
    const px = this.sx * 10;
    const py = this.sy * 6;
    for (const s of this.stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.t * 2 + s.p));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fff6d8';
      ctx.beginPath();
      ctx.arc(s.x * w + px * 0.4, s.y * h + py * 0.4, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // crescent centred at the top, between the two lantern groups and above the text
    const R = Math.max(16, Math.min(w * 0.06, h * 0.075, 52));
    const cx = w * 0.5 + px;
    const cy = R + 14 + py;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 3);
    glow.addColorStop(0, 'rgba(255, 220, 140, 0.35)');
    glow.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // crescent drawn on an offscreen-free path: outer circle minus offset circle
    ctx.save();
    const body = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    body.addColorStop(0, '#fff1c1');
    body.addColorStop(0.5, GOLD_LIGHT);
    body.addColorStop(1, GOLD);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const off = this.opts.rtl ? -R * 0.42 : R * 0.42;
    ctx.arc(cx + off, cy - R * 0.18, R * 0.86, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();
  }

  private drawFlakes(list: Flake[]) {
    const { ctx } = this;
    for (const f of list) {
      const near = 1 - f.z;
      const x = f.x + this.sx * near * 30;
      const y = f.y + this.sy * near * 12;
      if (f.shape === 0) {
        if (f.color === '#ffffff') {
          // 3D-shaded snowball
          if (f.r < 2.2) {
            ctx.globalAlpha = 0.55 + near * 0.3;
            ctx.fillStyle = this.opts.onLight ? '#c9d8ea' : '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, f.r, 0, Math.PI * 2);
            ctx.fill();
          } else {
            if (this.opts.onLight) {
              // soft cool shadow so the snowball reads on white backgrounds
              ctx.globalAlpha = 0.5;
              ctx.fillStyle = 'rgba(92, 122, 165, 0.35)';
              ctx.beginPath();
              ctx.arc(x + f.r * 0.12, y + f.r * 0.18, f.r * 1.08, 0, Math.PI * 2);
              ctx.fill();
            }
            const g = ctx.createRadialGradient(x - f.r * 0.35, y - f.r * 0.4, f.r * 0.1, x, y, f.r);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.55, '#eef5ff');
            g.addColorStop(0.9, 'rgba(196, 214, 238, 0.95)');
            g.addColorStop(1, 'rgba(196, 214, 238, 0)');
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, f.r, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // golden star dot
          ctx.globalAlpha = 0.6 + 0.4 * Math.sin(this.t * 3 + f.phase);
          ctx.fillStyle = f.color;
          this.starPath(x, y, f.r * 1.8, f.r * 0.7, f.rot);
          ctx.fill();
        }
      } else if (f.shape === 1) {
        // confetti with a 3D flip
        const flip = Math.cos(f.rot * 1.7);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(f.rot);
        ctx.scale(1, Math.max(0.12, Math.abs(flip)));
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = f.color;
        ctx.fillRect(-f.r, -f.r * 0.55, f.r * 2, f.r * 1.1);
        if (flip < 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(-f.r, -f.r * 0.55, f.r * 2, f.r * 1.1);
        }
        ctx.restore();
      } else {
        // small crescent
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.translate(x, y);
        ctx.rotate(f.rot * 0.2);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(0, 0, f.r, 0, Math.PI * 2);
        ctx.arc(f.r * 0.4, -f.r * 0.15, f.r * 0.85, 0, Math.PI * 2, true);
        ctx.fill('evenodd');
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  private starPath(x: number, y: number, R: number, r: number, rot: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? R : r;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  private drawLantern(l: Lantern) {
    const { ctx } = this;
    const s = this.scaleOf(l.z);
    const ax = l.ax * this.w + this.sx * (1 - l.z) * 28;
    const ay = -6;
    const L = l.len * s;
    const hx = ax + Math.sin(l.a) * L;
    const hy = ay + Math.cos(l.a) * L;
    const fog = l.z * 0.35; // far lanterns are a little hazier

    // chain
    ctx.save();
    ctx.strokeStyle = GOLD_DARK;
    ctx.globalAlpha = 0.85 - fog;
    ctx.lineWidth = Math.max(1, 1.6 * s);
    ctx.setLineDash([3 * s, 2.5 * s]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-l.a);
    ctx.scale(s, s);
    ctx.globalAlpha = 1 - fog;

    const light = l.flicker + l.boost * 0.5;
    const rgb = hexToRgb(l.glass) || [255, 179, 71];

    // outer glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, 62, 4, 0, 62, 95);
    glow.addColorStop(0, `rgba(255, 214, 140, ${0.42 * light})`);
    glow.addColorStop(0.45, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.16 * light})`);
    glow.addColorStop(1, 'rgba(255, 200, 120, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 62, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // metal gradient that shifts with the swing (fake light from the top-start)
    const shade = Math.sin(l.a) * 14;
    const metal = ctx.createLinearGradient(-24 + shade, 0, 24 + shade, 0);
    metal.addColorStop(0, GOLD_DARK);
    metal.addColorStop(0.35, GOLD_LIGHT);
    metal.addColorStop(0.6, GOLD);
    metal.addColorStop(1, GOLD_DARK);

    // hook ring
    ctx.strokeStyle = metal;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 5, 5, 0, Math.PI * 2);
    ctx.stroke();

    // dome
    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(-15, 30);
    ctx.quadraticCurveTo(-12, 12, 0, 9);
    ctx.quadraticCurveTo(12, 12, 15, 30);
    ctx.closePath();
    ctx.fill();
    // dome perforations
    ctx.fillStyle = `rgba(255, 236, 170, ${0.7 * light})`;
    for (const dx of [-6, 0, 6]) {
      ctx.beginPath();
      ctx.arc(dx, 22, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // top band
    ctx.fillStyle = metal;
    ctx.fillRect(-21, 29, 42, 6);

    // glass body (hexagonal fanous)
    const body = new Path2D();
    body.moveTo(-18, 35);
    body.lineTo(18, 35);
    body.lineTo(25, 61);
    body.lineTo(16, 88);
    body.lineTo(-16, 88);
    body.lineTo(-25, 61);
    body.closePath();

    const glass = ctx.createRadialGradient(0, 62, 3, 0, 62, 34);
    glass.addColorStop(0, `rgba(255, 250, 220, ${Math.min(1, 0.95 * light)})`);
    glass.addColorStop(0.35, `rgba(255, 214, 120, ${0.9 * light})`);
    glass.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.95)`);
    ctx.fillStyle = glass;
    ctx.fill(body);

    // stained-glass arches
    ctx.save();
    ctx.clip(body);
    ctx.strokeStyle = 'rgba(120, 70, 10, 0.45)';
    ctx.lineWidth = 1.2;
    for (const cx of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.moveTo(cx - 5, 84);
      ctx.lineTo(cx - 5, 52);
      ctx.quadraticCurveTo(cx, 42, cx + 5, 52);
      ctx.lineTo(cx + 5, 84);
      ctx.stroke();
    }
    // side shading for volume
    const vol = ctx.createLinearGradient(-25, 0, 25, 0);
    vol.addColorStop(0, 'rgba(0,0,0,0.28)');
    vol.addColorStop(0.3 + Math.sin(l.a) * 0.15, 'rgba(255,255,255,0.18)');
    vol.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = vol;
    ctx.fillRect(-26, 34, 52, 56);
    ctx.restore();

    // frame
    ctx.strokeStyle = metal;
    ctx.lineWidth = 2.2;
    ctx.stroke(body);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-25, 61);
    ctx.lineTo(25, 61);
    ctx.moveTo(-8, 35);
    ctx.lineTo(-7, 88);
    ctx.moveTo(8, 35);
    ctx.lineTo(7, 88);
    ctx.stroke();

    // bottom band + cone + finial
    ctx.fillStyle = metal;
    ctx.fillRect(-17, 87, 34, 5);
    ctx.beginPath();
    ctx.moveTo(-12, 92);
    ctx.lineTo(0, 110);
    ctx.lineTo(12, 92);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 113, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawSparks() {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.sparks) {
      const k = 1 - s.life / s.max;
      ctx.globalAlpha = k;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.6 + k * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
