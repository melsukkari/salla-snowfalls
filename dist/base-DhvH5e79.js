import { svg as u, html as p, LitElement as X, css as V, nothing as M } from "lit";
import { state as b, property as Q } from "lit/decorators.js";
import { unsafeHTML as J } from "lit/directives/unsafe-html.js";
const Y = {
  check: u`<path d="M20 6 9 17l-5-5"/>`,
  x: u`<path d="M18 6 6 18M6 6l12 12"/>`,
  truck: u`<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>`,
  shield: u`<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>`,
  card: u`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>`,
  return: u`<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>`,
  star: u`<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>`,
  gift: u`<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 4s.5 4 4 4zM12 8s1.5-5 4-4-.5 4-4 4z"/>`,
  clock: u`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  chat: u`<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>`,
  sparkle: u`<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>`,
  heart: u`<path d="M20.8 8.6a5 5 0 0 0-8.8-3.2 5 5 0 0 0-8.8 3.2c0 5.4 8.8 11 8.8 11s8.8-5.6 8.8-11z"/>`,
  leaf: u`<path d="M5 19c8 0 14-6 14-15-9 0-15 6-15 14z"/><path d="M5 19 13 11"/>`,
  bolt: u`<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>`,
  medal: u`<circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 3h4l2 4 2-4h4l-2.5 7"/>`,
  phone: u`<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>`,
  moon: u`<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>`,
  tag: u`<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>`,
  arrow: u`<path d="M5 12h14M13 6l6 6-6 6"/>`,
  chevron: u`<path d="m6 9 6 6 6-6"/>`
};
function E(r, e = "mw-icon") {
  const t = Y[r] || Y.check;
  return p`<svg
    class=${e}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >${t}</svg>`;
}
function S() {
  return window.Salla;
}
function P() {
  var s, o, n;
  const r = S(), e = ((o = (s = r == null ? void 0 : r.config) == null ? void 0 : s.get) == null ? void 0 : o.call(s, "user.language_code")) || ((n = r == null ? void 0 : r.lang) == null ? void 0 : n.locale), t = document.documentElement.lang;
  return String(e || t || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
}
function R() {
  var e;
  const r = document.documentElement.dir || ((e = document.body) == null ? void 0 : e.dir);
  return r ? r.toLowerCase() === "rtl" : P() === "ar";
}
function q(r, e = "") {
  if (r == null) return e;
  if (typeof r == "string") return r.trim() ? r : e;
  if (typeof r == "number") return String(r);
  if (typeof r == "object" && !Array.isArray(r)) {
    const t = r, i = P(), s = t[i] || t.ar || t.en || Object.values(t).find((o) => typeof o == "string" && o.trim());
    return typeof s == "string" && s.trim() ? s : e;
  }
  return e;
}
function G(r, e) {
  if (r == null || r === "") return e;
  if (Array.isArray(r)) {
    const t = r[0];
    return t && typeof t == "object" ? t.value ?? t.key ?? e : t ?? e;
  }
  if (typeof r == "object") {
    const t = r;
    return t.value ?? t.key ?? e;
  }
  return String(r);
}
function wt(r) {
  return r ? (Array.isArray(r) ? r : [r]).map((t) => t && typeof t == "object" ? t.value ?? t.id : t).filter((t) => t != null && t !== "") : [];
}
function kt(r) {
  return Array.isArray(r) ? r : [];
}
function Mt(r, e = !1) {
  return r == null || r === "" ? e : typeof r == "boolean" ? r : typeof r == "number" ? r !== 0 : typeof r == "string" ? ["1", "true", "yes", "on"].includes(r.toLowerCase()) : e;
}
function Z(r, e) {
  const t = typeof r == "number" ? r : parseFloat(String(r ?? ""));
  return Number.isFinite(t) ? t : e;
}
function tt(r) {
  const e = q(r).trim();
  return e ? /^(https?:|mailto:|tel:|\/|#|\?)/i.test(e) ? e : /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(e) ? `https://${e}` : "#" : "";
}
function $t(r) {
  const e = q(r).trim();
  return e && /^(https?:\/\/|\/|data:image\/)/i.test(e) ? e : "";
}
function H(r) {
  const e = S();
  if (r && typeof r == "object") {
    const i = r;
    return e != null && e.money ? e.money(i) : `${i.amount ?? ""} ${i.currency ?? ""}`.trim();
  }
  const t = Z(r, NaN);
  return Number.isFinite(t) ? e != null && e.money ? e.money(t) : `${t.toLocaleString(P() === "ar" ? "ar-SA" : "en-US")} ${P() === "ar" ? "ر.س" : "SAR"}` : "";
}
async function et(r = 4e3) {
  const e = S();
  if (e != null && e.onReady)
    return await Promise.race([e.onReady(), new Promise((t) => setTimeout(t, r))]), S();
}
function D() {
  return typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
const st = {
  add_to_cart: { ar: "أضف للسلة", en: "Add to cart" },
  added: { ar: "تمت الإضافة للسلة", en: "Added to cart" },
  view: { ar: "عرض المنتج", en: "View product" },
  out_of_stock: { ar: "نفدت الكمية", en: "Out of stock" },
  days: { ar: "يوم", en: "Days" },
  hours: { ar: "ساعة", en: "Hours" },
  minutes: { ar: "دقيقة", en: "Min" },
  seconds: { ar: "ثانية", en: "Sec" },
  close: { ar: "إغلاق", en: "Close" },
  pick_products: { ar: "اختر المنتجات من إعدادات العنصر", en: "Choose products in the component settings" },
  error: { ar: "تعذّر تنفيذ الطلب، حاول مرة أخرى", en: "Something went wrong, please try again" },
  quantity: { ar: "الكمية", en: "Quantity" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  keep_shopping: { ar: "متابعة التسوق", en: "Keep shopping" },
  back: { ar: "رجوع للمنتجات", en: "Back to products" },
  choose_options: { ar: "اختر المقاس/اللون من صفحة المنتج", en: "Choose size/colour on the product page" },
  options_note: { ar: "هذا المنتج له خيارات، اختر ما يناسبك من صفحة المنتج.", en: "This product has options — pick yours on the product page." },
  added_long: { ar: "تمت الإضافة إلى سلتك بنجاح 🎉", en: "Added to your cart 🎉" },
  quick_view: { ar: "عرض سريع", en: "Quick view" },
  increase: { ar: "زيادة", en: "Increase" },
  decrease: { ar: "إنقاص", en: "Decrease" },
  details: { ar: "تفاصيل المنتج", en: "Product details" },
  loading: { ar: "جارٍ التحميل…", en: "Loading…" },
  campaign: { ar: "منتجات العرض", en: "Offer products" }
};
function f(r) {
  const e = st[r];
  return e ? e[P()] : r;
}
const I = /* @__PURE__ */ new Map();
function U(r) {
  const e = String(r);
  return I.has(e) || I.set(
    e,
    (async () => {
      var i, s, o;
      const t = await et();
      if (!((s = (i = t == null ? void 0 : t.product) == null ? void 0 : i.api) != null && s.getDetails)) return null;
      try {
        const n = await t.product.api.getDetails(r);
        return (n == null ? void 0 : n.data) || null;
      } catch (n) {
        return (o = t == null ? void 0 : t.log) == null || o.call(t, "Mawsim: could not load product", r, n), I.delete(e), null;
      }
    })()
  ), I.get(e);
}
async function it(r) {
  return (await Promise.all(r.map((t) => U(t)))).filter((t) => !!t);
}
function B(r) {
  return !!(r.has_options || Array.isArray(r.options) && r.options.length);
}
function rt(r) {
  return r.is_available === !1 || r.is_out_of_stock === !0;
}
function O(r) {
  var t;
  const e = [(t = r.image) == null ? void 0 : t.url, ...(r.images || []).filter((i) => !i.type || i.type === "image").map((i) => i.url)].filter((i) => !!i && /^(https?:\/\/|\/|data:image\/)/i.test(i));
  return Array.from(new Set(e)).slice(0, 8);
}
function nt(r) {
  var t;
  if (!r) return "";
  const e = new DOMParser().parseFromString(`<div>${r}</div>`, "text/html");
  return e.querySelectorAll("script,style,iframe,object,embed,form,link,meta,base").forEach((i) => i.remove()), e.querySelectorAll("*").forEach((i) => {
    for (const s of Array.from(i.attributes)) {
      const o = s.name.toLowerCase();
      o.startsWith("on") && i.removeAttribute(s.name), (o === "href" || o === "src") && /^\s*javascript:/i.test(s.value) && i.removeAttribute(s.name);
    }
  }), ((t = e.body.firstElementChild) == null ? void 0 : t.innerHTML) || "";
}
const W = "__mawsimCampaign";
function St(r) {
  window[W] = r;
}
function ot() {
  var e;
  const r = window[W];
  return r && ((e = r.ids) != null && e.length) ? r : void 0;
}
const C = "#f6d27a", _ = "#d9a441", j = "#9c6b1f", L = () => typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function at(r) {
  const e = r.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!e) return null;
  let t = e[1];
  return t.length === 3 && (t = t.split("").map((i) => i + i).join("")), [parseInt(t.slice(0, 2), 16), parseInt(t.slice(2, 4), 16), parseInt(t.slice(4, 6), 16)];
}
const m = (r, e) => r + Math.random() * (e - r);
class ct {
  constructor(e, t) {
    this.canvas = e, this.opts = t, this.w = 0, this.h = 0, this.dpr = 1, this.raf = 0, this.last = 0, this.t = 0, this.visible = !0, this.running = !1, this.destroyed = !1, this.lanterns = [], this.flakes = [], this.sparks = [], this.stars = [], this.px = -9999, this.py = -9999, this.pvx = 0, this.pvy = 0, this.tx = 0, this.ty = 0, this.sx = 0, this.sy = 0, this.cleanup = [], this.ctx = e.getContext("2d"), this.opts = { mode: "section", density: 1, accent: "#0f766e", rtl: !0, ...t }, this.bind(), this.resize(), L() ? (this.step(0), this.draw()) : this.start();
  }
  /** Change kind/accent/density without recreating the canvas. */
  update(e) {
    Object.assign(this.opts, e), this.populate(), L() && this.draw();
  }
  destroy() {
    var e, t;
    this.destroyed = !0, this.stop(), this.cleanup.forEach((i) => i()), (e = this.ro) == null || e.disconnect(), (t = this.io) == null || t.disconnect();
  }
  // ------------------------------------------------------------------ lifecycle
  start() {
    if (this.running || this.destroyed) return;
    this.running = !0, this.last = performance.now();
    const e = (t) => {
      if (!this.running) return;
      const i = Math.min(0.033, (t - this.last) / 1e3);
      this.last = t, this.visible && !document.hidden && (this.step(i), this.draw()), this.raf = requestAnimationFrame(e);
    };
    this.raf = requestAnimationFrame(e);
  }
  stop() {
    this.running = !1, cancelAnimationFrame(this.raf);
  }
  bind() {
    const e = this.opts.mode === "page", t = this.opts.pointerTarget || (e ? window : this.canvas.parentElement || window), i = (c, h) => {
      const l = this.canvas.getBoundingClientRect();
      return { x: c - l.left, y: h - l.top, r: l };
    }, s = (c) => {
      const { x: h, y: l, r: d } = i(c.clientX, c.clientY);
      this.px > -9e3 && (this.pvx = this.pvx * 0.5 + (h - this.px) * 0.5, this.pvy = this.pvy * 0.5 + (l - this.py) * 0.5), this.px = h, this.py = l, this.tx = Math.max(-1, Math.min(1, h / Math.max(1, d.width) * 2 - 1)), this.ty = Math.max(-1, Math.min(1, l / Math.max(1, d.height) * 2 - 1)), this.nudgeLanterns();
    }, o = () => {
      this.px = this.py = -9999, this.pvx = this.pvy = 0, this.tx = this.ty = 0;
    }, n = (c) => {
      const { x: h, y: l } = i(c.clientX, c.clientY);
      this.tap(h, l);
    }, a = (c) => {
      c.gamma == null || c.beta == null || (this.tx = Math.max(-1, Math.min(1, c.gamma / 30)), this.ty = Math.max(-1, Math.min(1, (c.beta - 40) / 30)));
    };
    if (t.addEventListener("pointermove", s, { passive: !0 }), t.addEventListener("pointerleave", o, { passive: !0 }), t.addEventListener("pointerdown", n, { passive: !0 }), window.addEventListener("deviceorientation", a, { passive: !0 }), this.cleanup.push(() => {
      t.removeEventListener("pointermove", s), t.removeEventListener("pointerleave", o), t.removeEventListener("pointerdown", n), window.removeEventListener("deviceorientation", a);
    }), typeof ResizeObserver < "u")
      this.ro = new ResizeObserver(() => this.resize()), this.ro.observe(this.canvas);
    else {
      const c = () => this.resize();
      window.addEventListener("resize", c), this.cleanup.push(() => window.removeEventListener("resize", c));
    }
    typeof IntersectionObserver < "u" && !e && (this.io = new IntersectionObserver((c) => {
      this.visible = c.some((h) => h.isIntersecting);
    }), this.io.observe(this.canvas));
  }
  resize() {
    const e = this.canvas.getBoundingClientRect(), t = Math.max(1, Math.round(e.width)), i = Math.max(1, Math.round(e.height));
    if (t === this.w && i === this.h) return;
    const s = this.w === 0;
    this.w = t, this.h = i, this.dpr = Math.min(window.devicePixelRatio || 1, t < 600 ? 1.5 : 2), this.canvas.width = Math.round(t * this.dpr), this.canvas.height = Math.round(i * this.dpr), this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0), s || this.flakes.length === 0 ? this.populate() : this.layoutLanterns(), L() && this.draw();
  }
  // ------------------------------------------------------------------ content
  has(e) {
    const t = this.opts.kind, i = this.opts.mode === "page";
    switch (e) {
      case "lanterns":
        return !i && (t === "ramadan" || t === "ramadan-snow");
      case "crescent":
        return !i && (t === "ramadan" || t === "ramadan-snow");
      case "snow":
        return t === "snow" || t === "ramadan-snow";
      case "confetti":
        return t === "confetti";
      case "stars":
        return t === "stars" || i && t === "ramadan";
    }
  }
  palette() {
    return [this.opts.accent || "#0f766e", _, "#ffffff", "#ff6b81", "#60c6ff", "#f9d65c", "#8ef0c2"];
  }
  populate() {
    this.layoutLanterns(), this.flakes = [], this.stars = [];
    const e = this.w * this.h / (1280 * 700), t = Math.max(0.4, Math.min(2, this.opts.density ?? 1)), i = this.w < 600;
    if (this.has("crescent")) {
      const n = Math.round(Math.min(90, 55 * e) * t);
      for (let a = 0; a < n; a++)
        this.stars.push({ x: Math.random(), y: Math.random() * 0.75, r: m(0.6, 1.8), p: m(0, Math.PI * 2) });
    }
    const s = (n, a, c, h, l) => {
      for (let d = 0; d < n; d++) {
        const g = Math.random(), w = 1 - g;
        this.flakes.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          z: g,
          r: h + (l - h) * w * w,
          vy: 18 + 70 * w,
          sway: m(8, 26) * w,
          phase: m(0, Math.PI * 2),
          vx: 0,
          rot: m(0, Math.PI * 2),
          vr: m(-3, 3),
          color: c(),
          shape: a
        });
      }
    }, o = Math.max(12, Math.min(i ? 70 : 150, 110 * e));
    if (this.has("snow") && s(Math.round(o * t), 0, () => "#ffffff", 1.4, i ? 6 : 8), this.has("confetti")) {
      const n = this.palette();
      s(Math.round(o * 0.7 * t), 1, () => n[Math.floor(Math.random() * n.length)], 3, 7);
    }
    this.has("stars") && (s(Math.round(o * 0.45 * t), 0, () => C, 1.2, 3.2), s(Math.round(o * 0.08 * t), 2, () => _, 5, 10)), this.flakes.sort((n, a) => a.z - n.z);
  }
  layoutLanterns() {
    if (!this.has("lanterns")) {
      this.lanterns = [];
      return;
    }
    const t = ["#ffb347", this.opts.accent || "#0f766e", "#ff5d73", "#4fd1c5", "#b794f4", "#ffd166"], i = this.w < 640, s = i || this.w < 1e3 ? 2 : 3, o = [], n = i ? 0.26 : 0.22;
    for (let h = 0; h < s; h++) {
      const l = s === 1 ? 0.5 : h / (s - 1);
      o.push(0.04 + l * n), o.push(0.96 - l * n);
    }
    const a = this.lanterns, c = i ? Math.max(20, Math.min(this.h * 0.12, 70)) : Math.max(30, Math.min(this.h * 0.32, 220));
    this.lanterns = o.map((h, l) => {
      const d = a[l], g = [0.1, 0.55, 0.85, 0.3, 0.7, 0.2][l % 6];
      return {
        ax: h,
        z: g,
        len: (d == null ? void 0 : d.len) ?? m(c * 0.25, c),
        a: (d == null ? void 0 : d.a) ?? m(-0.08, 0.08),
        w: (d == null ? void 0 : d.w) ?? 0,
        glass: (d == null ? void 0 : d.glass) ?? t[l % t.length],
        phase: (d == null ? void 0 : d.phase) ?? m(0, Math.PI * 2),
        flicker: 1,
        boost: 0
      };
    });
  }
  scaleOf(e) {
    return (this.w < 640 ? 0.55 : this.w < 1e3 ? 0.75 : 0.95) * (0.55 + (1 - e) * 0.6);
  }
  /** Screen position of a lantern's glass centre. */
  lanternCenter(e) {
    const t = this.scaleOf(e.z), i = e.ax * this.w + this.sx * (1 - e.z) * 28, s = -6, o = e.len * t + 60 * t;
    return { x: i + Math.sin(e.a) * o, y: s + Math.cos(e.a) * o, s: t };
  }
  nudgeLanterns() {
    for (const e of this.lanterns) {
      const t = this.lanternCenter(e), i = this.px - t.x, s = this.py - t.y, o = Math.hypot(i, s), n = 70 * t.s + 20;
      o < n && (e.w += this.pvx * 0.012 * (1 - o / n) / Math.max(0.6, t.s), e.boost = Math.min(1, e.boost + 0.08));
    }
  }
  tap(e, t) {
    let i = !1;
    for (const s of this.lanterns) {
      const o = this.lanternCenter(s);
      Math.hypot(e - o.x, t - o.y) < 60 * o.s + 16 && (s.w += (e < o.x ? 1 : -1) * m(1.4, 2.2), s.boost = 1, this.burst(o.x, o.y, 34, [C, "#fff3c4", s.glass]), i = !0);
    }
    if (!i) {
      const s = this.has("confetti") ? this.palette() : [C, "#ffffff", "#fff3c4"];
      this.burst(e, t, 22, s);
    }
    for (const s of this.flakes) {
      const o = s.x - e, n = s.y - t, a = Math.hypot(o, n);
      if (a < 140) {
        const c = (1 - a / 140) * 260;
        s.vx += o / (a || 1) * c, s.y += n / (a || 1) * c * 0.05;
      }
    }
    L() && this.draw();
  }
  burst(e, t, i, s) {
    if (!L()) {
      for (let o = 0; o < i; o++) {
        const n = m(0, Math.PI * 2), a = m(60, 260);
        this.sparks.push({
          x: e,
          y: t,
          vx: Math.cos(n) * a,
          vy: Math.sin(n) * a - 60,
          life: 0,
          max: m(0.5, 1.1),
          r: m(1.2, 3.2),
          color: s[o % s.length]
        });
      }
      this.sparks.length > 400 && this.sparks.splice(0, this.sparks.length - 400);
    }
  }
  // ------------------------------------------------------------------ simulation
  step(e) {
    this.t += e, this.sx += (this.tx - this.sx) * Math.min(1, e * 4), this.sy += (this.ty - this.sy) * Math.min(1, e * 4), this.pvx *= 0.9, this.pvy *= 0.9;
    for (const s of this.lanterns) {
      const o = 6 * (120 / (s.len + 60)), n = Math.sin(this.t * 0.8 + s.phase) * 0.06, a = -o * Math.sin(s.a) - 0.7 * s.w + n;
      s.w += a * e, s.a += s.w * e, s.a = Math.max(-0.9, Math.min(0.9, s.a)), s.boost = Math.max(0, s.boost - e * 0.6), s.flicker = 0.88 + Math.sin(this.t * 9 + s.phase) * 0.05 + Math.sin(this.t * 23 + s.phase * 2) * 0.04;
    }
    const t = this.w, i = this.h;
    for (const s of this.flakes) {
      const o = 1 - s.z;
      if (s.y += s.vy * e, s.x += (Math.sin(this.t * 1.2 + s.phase) * s.sway + s.vx) * e, s.vx *= 1 - Math.min(1, e * 2.2), s.rot += s.vr * e, this.px > -9e3) {
        const n = s.x - this.px, a = s.y - this.py, c = n * n + a * a;
        if (c < 12100) {
          const h = Math.sqrt(c) || 1, l = (1 - h / 110) * 220 * (0.4 + o);
          s.vx += n / h * l * e * 6 + this.pvx * 0.6;
        }
      }
      s.y - s.r > i + 10 && (s.y = -s.r - m(0, 40), s.x = Math.random() * t, s.vx = 0), s.x < -30 && (s.x = t + 20), s.x > t + 30 && (s.x = -20);
    }
    for (const s of this.sparks)
      s.life += e, s.vy += 240 * e, s.vx *= 1 - e * 1.5, s.x += s.vx * e, s.y += s.vy * e;
    this.sparks = this.sparks.filter((s) => s.life < s.max);
  }
  // ------------------------------------------------------------------ drawing
  draw() {
    const { ctx: e, w: t, h: i } = this;
    e.clearRect(0, 0, t, i), this.has("crescent") && this.drawSky();
    const s = this.flakes.findIndex((a) => a.z < 0.45), o = s === -1 ? this.flakes : this.flakes.slice(0, s), n = s === -1 ? [] : this.flakes.slice(s);
    this.drawFlakes(o), [...this.lanterns].sort((a, c) => c.z - a.z).forEach((a) => this.drawLantern(a)), this.drawFlakes(n), this.drawSparks();
  }
  drawSky() {
    const { ctx: e, w: t, h: i } = this, s = this.sx * 10, o = this.sy * 6;
    for (const g of this.stars) {
      const w = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.t * 2 + g.p));
      e.globalAlpha = w, e.fillStyle = "#fff6d8", e.beginPath(), e.arc(g.x * t + s * 0.4, g.y * i + o * 0.4, g.r, 0, Math.PI * 2), e.fill();
    }
    e.globalAlpha = 1;
    const n = Math.max(16, Math.min(t * 0.06, i * 0.075, 52)), a = t * 0.5 + s, c = n + 14 + o, h = e.createRadialGradient(a, c, n * 0.4, a, c, n * 3);
    h.addColorStop(0, "rgba(255, 220, 140, 0.35)"), h.addColorStop(1, "rgba(255, 220, 140, 0)"), e.save(), e.globalCompositeOperation = "lighter", e.fillStyle = h, e.beginPath(), e.arc(a, c, n * 3, 0, Math.PI * 2), e.fill(), e.restore(), e.save();
    const l = e.createLinearGradient(a - n, c - n, a + n, c + n);
    l.addColorStop(0, "#fff1c1"), l.addColorStop(0.5, C), l.addColorStop(1, _), e.fillStyle = l, e.beginPath(), e.arc(a, c, n, 0, Math.PI * 2);
    const d = this.opts.rtl ? -n * 0.42 : n * 0.42;
    e.arc(a + d, c - n * 0.18, n * 0.86, 0, Math.PI * 2, !0), e.fill("evenodd"), e.restore();
  }
  drawFlakes(e) {
    const { ctx: t } = this;
    for (const i of e) {
      const s = 1 - i.z, o = i.x + this.sx * s * 30, n = i.y + this.sy * s * 12;
      if (i.shape === 0)
        if (i.color === "#ffffff")
          if (i.r < 2.2)
            t.globalAlpha = 0.55 + s * 0.3, t.fillStyle = this.opts.onLight ? "#c9d8ea" : "#ffffff", t.beginPath(), t.arc(o, n, i.r, 0, Math.PI * 2), t.fill();
          else {
            this.opts.onLight && (t.globalAlpha = 0.5, t.fillStyle = "rgba(92, 122, 165, 0.35)", t.beginPath(), t.arc(o + i.r * 0.12, n + i.r * 0.18, i.r * 1.08, 0, Math.PI * 2), t.fill());
            const a = t.createRadialGradient(o - i.r * 0.35, n - i.r * 0.4, i.r * 0.1, o, n, i.r);
            a.addColorStop(0, "#ffffff"), a.addColorStop(0.55, "#eef5ff"), a.addColorStop(0.9, "rgba(196, 214, 238, 0.95)"), a.addColorStop(1, "rgba(196, 214, 238, 0)"), t.globalAlpha = 0.95, t.fillStyle = a, t.beginPath(), t.arc(o, n, i.r, 0, Math.PI * 2), t.fill();
          }
        else
          t.globalAlpha = 0.6 + 0.4 * Math.sin(this.t * 3 + i.phase), t.fillStyle = i.color, this.starPath(o, n, i.r * 1.8, i.r * 0.7, i.rot), t.fill();
      else if (i.shape === 1) {
        const a = Math.cos(i.rot * 1.7);
        t.save(), t.translate(o, n), t.rotate(i.rot), t.scale(1, Math.max(0.12, Math.abs(a))), t.globalAlpha = 0.9, t.fillStyle = i.color, t.fillRect(-i.r, -i.r * 0.55, i.r * 2, i.r * 1.1), a < 0 && (t.fillStyle = "rgba(0,0,0,0.18)", t.fillRect(-i.r, -i.r * 0.55, i.r * 2, i.r * 1.1)), t.restore();
      } else
        t.save(), t.globalAlpha = 0.85, t.translate(o, n), t.rotate(i.rot * 0.2), t.fillStyle = i.color, t.beginPath(), t.arc(0, 0, i.r, 0, Math.PI * 2), t.arc(i.r * 0.4, -i.r * 0.15, i.r * 0.85, 0, Math.PI * 2, !0), t.fill("evenodd"), t.restore();
    }
    t.globalAlpha = 1;
  }
  starPath(e, t, i, s, o) {
    const n = this.ctx;
    n.beginPath();
    for (let a = 0; a < 10; a++) {
      const c = o + a * Math.PI / 5, h = a % 2 === 0 ? i : s, l = e + Math.cos(c) * h, d = t + Math.sin(c) * h;
      a === 0 ? n.moveTo(l, d) : n.lineTo(l, d);
    }
    n.closePath();
  }
  drawLantern(e) {
    const { ctx: t } = this, i = this.scaleOf(e.z), s = e.ax * this.w + this.sx * (1 - e.z) * 28, o = -6, n = e.len * i, a = s + Math.sin(e.a) * n, c = o + Math.cos(e.a) * n, h = e.z * 0.35;
    t.save(), t.strokeStyle = j, t.globalAlpha = 0.85 - h, t.lineWidth = Math.max(1, 1.6 * i), t.setLineDash([3 * i, 2.5 * i]), t.beginPath(), t.moveTo(s, o), t.lineTo(a, c), t.stroke(), t.restore(), t.save(), t.translate(a, c), t.rotate(-e.a), t.scale(i, i), t.globalAlpha = 1 - h;
    const l = e.flicker + e.boost * 0.5, d = at(e.glass) || [255, 179, 71];
    t.save(), t.globalCompositeOperation = "lighter";
    const g = t.createRadialGradient(0, 62, 4, 0, 62, 95);
    g.addColorStop(0, `rgba(255, 214, 140, ${0.42 * l})`), g.addColorStop(0.45, `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${0.16 * l})`), g.addColorStop(1, "rgba(255, 200, 120, 0)"), t.fillStyle = g, t.beginPath(), t.arc(0, 62, 95, 0, Math.PI * 2), t.fill(), t.restore();
    const w = Math.sin(e.a) * 14, k = t.createLinearGradient(-24 + w, 0, 24 + w, 0);
    k.addColorStop(0, j), k.addColorStop(0.35, C), k.addColorStop(0.6, _), k.addColorStop(1, j), t.strokeStyle = k, t.lineWidth = 2.4, t.beginPath(), t.arc(0, 5, 5, 0, Math.PI * 2), t.stroke(), t.fillStyle = k, t.beginPath(), t.moveTo(-15, 30), t.quadraticCurveTo(-12, 12, 0, 9), t.quadraticCurveTo(12, 12, 15, 30), t.closePath(), t.fill(), t.fillStyle = `rgba(255, 236, 170, ${0.7 * l})`;
    for (const $ of [-6, 0, 6])
      t.beginPath(), t.arc($, 22, 1.4, 0, Math.PI * 2), t.fill();
    t.fillStyle = k, t.fillRect(-21, 29, 42, 6);
    const x = new Path2D();
    x.moveTo(-18, 35), x.lineTo(18, 35), x.lineTo(25, 61), x.lineTo(16, 88), x.lineTo(-16, 88), x.lineTo(-25, 61), x.closePath();
    const A = t.createRadialGradient(0, 62, 3, 0, 62, 34);
    A.addColorStop(0, `rgba(255, 250, 220, ${Math.min(1, 0.95 * l)})`), A.addColorStop(0.35, `rgba(255, 214, 120, ${0.9 * l})`), A.addColorStop(1, `rgba(${d[0]}, ${d[1]}, ${d[2]}, 0.95)`), t.fillStyle = A, t.fill(x), t.save(), t.clip(x), t.strokeStyle = "rgba(120, 70, 10, 0.45)", t.lineWidth = 1.2;
    for (const $ of [-12, 0, 12])
      t.beginPath(), t.moveTo($ - 5, 84), t.lineTo($ - 5, 52), t.quadraticCurveTo($, 42, $ + 5, 52), t.lineTo($ + 5, 84), t.stroke();
    const z = t.createLinearGradient(-25, 0, 25, 0);
    z.addColorStop(0, "rgba(0,0,0,0.28)"), z.addColorStop(0.3 + Math.sin(e.a) * 0.15, "rgba(255,255,255,0.18)"), z.addColorStop(1, "rgba(0,0,0,0.32)"), t.fillStyle = z, t.fillRect(-26, 34, 52, 56), t.restore(), t.strokeStyle = k, t.lineWidth = 2.2, t.stroke(x), t.lineWidth = 1.6, t.beginPath(), t.moveTo(-25, 61), t.lineTo(25, 61), t.moveTo(-8, 35), t.lineTo(-7, 88), t.moveTo(8, 35), t.lineTo(7, 88), t.stroke(), t.fillStyle = k, t.fillRect(-17, 87, 34, 5), t.beginPath(), t.moveTo(-12, 92), t.lineTo(0, 110), t.lineTo(12, 92), t.closePath(), t.fill(), t.beginPath(), t.arc(0, 113, 3, 0, Math.PI * 2), t.fill(), t.restore();
  }
  drawSparks() {
    const { ctx: e } = this;
    e.save(), e.globalCompositeOperation = "lighter";
    for (const t of this.sparks) {
      const i = 1 - t.life / t.max;
      e.globalAlpha = i, e.fillStyle = t.color, e.beginPath(), e.arc(t.x, t.y, t.r * (0.6 + i * 0.6), 0, Math.PI * 2), e.fill();
    }
    e.restore();
  }
}
var lt = Object.defineProperty, v = (r, e, t, i) => {
  for (var s = void 0, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (s = n(e, t, s) || s);
  return s && lt(e, t, s), s;
};
const T = "mawsim-overlay-board", ht = ["none", "ramadan", "snow", "ramadan-snow", "confetti", "stars"], N = class N extends X {
  constructor() {
    super(...arguments), this.opened = !1, this.closing = !1, this.view = "list", this.products = [], this.current = null, this.loading = !1, this.qty = 1, this.imgIndex = 0, this.busy = !1, this.added = !1, this.opts = {}, this.returnFocus = null, this.prevOverflow = "", this.listIds = [], this.onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault(), this.close();
        return;
      }
      if (e.key !== "Tab") return;
      const t = this.renderRoot.querySelector(".panel");
      if (!t) return;
      const i = Array.from(
        t.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
      ).filter((a) => a.offsetParent !== null);
      if (!i.length) return;
      const s = i[0], o = i[i.length - 1], n = this.renderRoot instanceof ShadowRoot ? this.renderRoot.activeElement : null;
      e.shiftKey && (n === s || !n) ? (e.preventDefault(), o.focus()) : !e.shiftKey && n === o && (e.preventDefault(), s.focus());
    };
  }
  // ------------------------------------------------------------------ public API
  async show(e) {
    var i;
    this.opts = e, this.listIds = (e.ids || []).slice(0, 12), this.added = !1, this.busy = !1, this.qty = 1, this.imgIndex = 0, this.returnFocus = pt();
    const t = (e.accent || "").trim();
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t) ? this.style.setProperty("--mw-accent", t) : this.style.removeProperty("--mw-accent"), this.setSky(e.scene || "none"), this.dir = R() ? "rtl" : "ltr", this.lang = P(), this.setAttribute("open", ""), document.removeEventListener("keydown", this.onKey, !0), document.addEventListener("keydown", this.onKey, !0), this.prevOverflow = document.documentElement.style.overflow, document.documentElement.style.overflow = "hidden", this.closing = !1, this.opened = !1, await this.updateComplete, requestAnimationFrame(() => this.opened = !0), this.startScene(), e.productId !== void 0 ? await this.openProduct(e.productId) : await this.openList(), (i = this.renderRoot.querySelector(".close")) == null || i.focus({ preventScroll: !0 });
  }
  close() {
    if (!this.hasAttribute("open") || this.closing) return;
    this.closing = !0, document.removeEventListener("keydown", this.onKey, !0);
    const e = () => {
      var t, i, s;
      this.removeAttribute("open"), this.closing = !1, this.opened = !1, (t = this.scene) == null || t.destroy(), this.scene = void 0, document.documentElement.style.overflow = this.prevOverflow, (s = (i = this.returnFocus) == null ? void 0 : i.focus) == null || s.call(i, { preventScroll: !0 });
    };
    D() ? e() : setTimeout(e, 280);
  }
  // ------------------------------------------------------------------ internals
  setSky(e) {
    const t = {
      ramadan: ["#2a1f5c", "#0b0b26"],
      "ramadan-snow": ["#24306b", "#0a0f2a"],
      snow: ["#1f3a63", "#0a1428"],
      stars: ["#2b2350", "#0d0b1f"],
      confetti: ["#26302f", "#0b1110"],
      none: ["#1c2423", "#0b1110"]
    }, [i, s] = t[e] || t.none;
    this.style.setProperty("--sky-1", i), this.style.setProperty("--sky-2", s);
  }
  startScene() {
    var s;
    const e = this.renderRoot.querySelector("canvas.scene"), t = ht.includes(this.opts.scene) ? this.opts.scene : "none";
    if ((s = this.scene) == null || s.destroy(), this.scene = void 0, !e || t === "none") return;
    const i = getComputedStyle(this).getPropertyValue("--mw-primary").trim() || "#0f766e";
    this.scene = new ct(e, {
      kind: t,
      mode: "section",
      accent: i,
      rtl: R(),
      pointerTarget: this.renderRoot.querySelector(".root"),
      density: 1.1
    });
  }
  async openList() {
    this.view = "list", this.current = null, this.added = !1, this.updateComplete.then(() => this.focusPanel()), this.listIds.length && (this.products.length && dt(this.products, this.listIds) || (this.loading = !0, this.products = await it(this.listIds), this.loading = !1));
  }
  /** After switching views, keep keyboard focus inside the dialog. */
  focusPanel() {
    var t;
    const e = this.renderRoot;
    e.activeElement && e.activeElement.isConnected || (t = e.querySelector(".close")) == null || t.focus({ preventScroll: !0 });
  }
  async openProduct(e) {
    var t;
    this.view = "product", this.added = !1, this.qty = 1, this.imgIndex = 0, this.loading = !0, this.current = await U(e), this.loading = !1, await this.updateComplete, (t = this.renderRoot.querySelector(".content")) == null || t.scrollTo({ top: 0 }), this.focusPanel();
  }
  async addToCart() {
    var i, s;
    const e = this.current, t = S();
    if (e) {
      if (B(e) || !((i = t == null ? void 0 : t.cart) != null && i.addItem)) {
        window.location.href = e.url;
        return;
      }
      this.busy = !0;
      try {
        await t.cart.addItem({ id: e.id, quantity: this.qty }), this.added = !0;
      } catch (o) {
        (s = t == null ? void 0 : t.log) == null || s.call(t, "Mawsim board: addItem failed", o);
      } finally {
        this.busy = !1;
      }
    }
  }
  cartUrl() {
    var t, i;
    const e = S();
    try {
      return ((i = (t = e == null ? void 0 : e.url) == null ? void 0 : t.get) == null ? void 0 : i.call(t, "cart")) || "/cart";
    } catch {
      return "/cart";
    }
  }
  tilt(e, t = 9) {
    if (D() || e.pointerType === "touch") return;
    const i = e.currentTarget, s = i.getBoundingClientRect(), o = (e.clientX - s.left) / s.width, n = (e.clientY - s.top) / s.height;
    i.style.setProperty("--ry", `${(o - 0.5) * t * 2}deg`), i.style.setProperty("--rx", `${(0.5 - n) * t * 2}deg`), i.style.setProperty("--mx", `${o * 100}%`), i.style.setProperty("--my", `${n * 100}%`);
  }
  untilt(e) {
    const t = e.currentTarget;
    t.style.setProperty("--rx", "0deg"), t.style.setProperty("--ry", "0deg");
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), document.removeEventListener("keydown", this.onKey, !0), (e = this.scene) == null || e.destroy();
  }
  // ------------------------------------------------------------------ render
  priceBlock(e) {
    const t = !!e.is_on_sale && e.sale_price && e.regular_price;
    return p`<div class="prices">
      <span class="price">${H(t ? e.sale_price : e.price)}</span>
      ${t ? p`<span class="old">${H(e.regular_price)}</span>` : M}
    </div>`;
  }
  renderList() {
    return this.loading && !this.products.length ? p`<div class="grid">${this.listIds.map(() => p`<div class="skel"></div>`)}</div>` : this.products.length ? p`<div class="grid">
      ${this.products.map(
      (e, t) => p`<button
          class="tile"
          style="animation-delay:${t * 45}ms"
          @click=${() => this.openProduct(e.id)}
          @pointermove=${(i) => this.tilt(i)}
          @pointerleave=${this.untilt}
          aria-label="${e.name} — ${f("quick_view")}"
        >
          <div class="img">
            ${O(e)[0] ? p`<img src=${O(e)[0]} alt="" loading="lazy" decoding="async" />` : M}
          </div>
          <span class="qv">${f("quick_view")}</span>
          <div class="info">
            <span class="name">${e.name}</span>
            ${this.priceBlock(e)}
          </div>
          <span class="shine"></span>
        </button>`
    )}
    </div>` : p`<div class="center">${f("pick_products")}</div>`;
  }
  renderProduct() {
    var c;
    const e = this.current;
    if (this.loading || !e)
      return p`<div class="center">${this.loading ? f("loading") : f("error")}</div>`;
    const t = O(e), i = t[this.imgIndex] || t[0], s = rt(e), o = B(e), n = Math.max(1, Math.min(20, e.max_quantity && e.max_quantity > 0 ? e.max_quantity : 20)), a = nt(e.description);
    return p`<div class="pv">
      <div class="gallery">
        <div class="main-img" @pointermove=${(h) => this.tilt(h, 6)} @pointerleave=${this.untilt}>
          ${i ? p`<img src=${i} alt=${((c = e.image) == null ? void 0 : c.alt) || e.name} decoding="async" />` : M}
        </div>
        ${t.length > 1 ? p`<div class="thumbs">
              ${t.map(
      (h, l) => p`<button
                  aria-current=${l === this.imgIndex ? "true" : "false"}
                  aria-label="${l + 1} / ${t.length}"
                  @click=${() => this.imgIndex = l}
                >
                  <img src=${h} alt="" loading="lazy" />
                </button>`
    )}
            </div>` : M}
      </div>
      <div>
        ${e.promotion_title ? p`<span class="promo">${e.promotion_title}</span>` : M}
        <h3>${e.name}</h3>
        ${e.subtitle ? p`<div style="color:var(--muted)">${e.subtitle}</div>` : M}
        ${this.priceBlock(e)}
        ${a ? p`<div class="desc" aria-label=${f("details")}>${J(a)}</div>` : M}

        ${this.added ? p`<div class="success" role="status">
              <strong>${f("added_long")}</strong>
              <div class="row">
                <a class="btn" href=${this.cartUrl()}>${f("checkout")}</a>
                ${this.listIds.length ? p`<button class="btn ghost" @click=${() => this.openList()}>${f("keep_shopping")}</button>` : p`<button class="btn ghost" @click=${() => this.close()}>${f("keep_shopping")}</button>`}
              </div>
            </div>` : o ? p`<div class="note">${f("options_note")}</div>
                <a class="btn" href=${e.url}>${f("choose_options")}</a>` : p`<div class="row">
                <div class="qty" role="group" aria-label=${f("quantity")}>
                  <button
                    aria-label=${f("decrease")}
                    ?disabled=${this.qty <= 1}
                    @click=${() => this.qty = Math.max(1, this.qty - 1)}
                  >
                    −
                  </button>
                  <output aria-live="polite">${this.qty}</output>
                  <button
                    aria-label=${f("increase")}
                    ?disabled=${this.qty >= n}
                    @click=${() => this.qty = Math.min(n, this.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button class="btn" ?disabled=${s || this.busy} @click=${this.addToCart}>
                  ${s ? f("out_of_stock") : p`${E("gift")} ${f("add_to_cart")}`}
                </button>
              </div>`}
      </div>
    </div>`;
  }
  render() {
    const e = this.opts, t = this.view === "product" && this.listIds.length > 0, i = this.view === "product" && this.current ? this.current.name : e.title || f("campaign"), s = [this.opened ? "open" : "", this.closing ? "closing" : ""].join(" ");
    return p`<div class="root ${s}">
      <div class="backdrop" @click=${() => this.close()}><canvas class="scene" aria-hidden="true"></canvas></div>
      <div class="stage" @click=${(o) => o.target === o.currentTarget && this.close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label=${i}>
          <header>
            ${t ? p`<button class="icon-btn back ${R() ? "" : "flip"}" aria-label=${f("back")}
                  @click=${() => this.openList()}>${E("arrow")}</button>` : M}
            <div class="titles">
              <h2>${this.view === "list" ? e.title || f("campaign") : f("quick_view")}</h2>
              ${this.view === "list" && e.subtitle ? p`<p>${e.subtitle}</p>` : M}
            </div>
            <button class="icon-btn close" aria-label=${f("close")} @click=${() => this.close()}>
              ${E("x")}
            </button>
          </header>
          <div class="content">${this.view === "list" ? this.renderList() : this.renderProduct()}</div>
        </div>
      </div>
    </div>`;
  }
};
N.styles = V`
    :host {
      --mw-primary: var(--mw-accent, var(--color-primary, var(--primary, #0f766e)));
      --mw-on-primary: var(--color-primary-reverse, #ffffff);
      --ink: #13201f;
      --muted: #5b6b69;
      --line: rgba(19, 32, 31, 0.1);
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: none;
      font-family: inherit;
      color: var(--ink);
      line-height: 1.6;
    }
    :host([open]) {
      display: block;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: radial-gradient(120% 80% at 50% 0%, var(--sky-1, #1d2b5a) 0%, var(--sky-2, #0a1024) 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .backdrop::after {
      content: '';
      position: absolute;
      inset: 0;
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: -1;
    }
    .open .backdrop {
      opacity: 0.97;
    }
    canvas.scene {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .panel {
      position: absolute;
      inset-inline: 0;
      margin-inline: auto;
      top: 50%;
      width: min(1020px, calc(100% - 32px));
      max-height: min(86vh, 860px);
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 26px;
      box-shadow:
        0 30px 80px -20px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.4) inset;
      overflow: hidden;
      transform: translateY(-46%) scale(0.94) rotateX(8deg);
      transform-origin: 50% 0;
      opacity: 0;
      transition:
        transform 0.42s cubic-bezier(0.2, 0.9, 0.25, 1.15),
        opacity 0.3s ease;
    }
    .stage {
      position: absolute;
      inset: 0;
      perspective: 1400px;
      pointer-events: none;
    }
    .stage > * {
      pointer-events: auto;
    }
    .open .panel {
      transform: translateY(-50%) scale(1) rotateX(0);
      opacity: 1;
    }
    .closing .panel {
      transform: translateY(-44%) scale(0.96);
      opacity: 0;
    }
    .closing .backdrop {
      opacity: 0;
    }

    header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, var(--mw-primary) 9%, #ffffff),
        #ffffff
      );
    }
    header .titles {
      flex: 1;
      min-width: 0;
    }
    header h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 800;
      line-height: 1.35;
    }
    header p {
      margin: 2px 0 0;
      font-size: 0.9rem;
      color: var(--muted);
    }
    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid var(--line);
      background: #ffffff;
      color: var(--ink);
      cursor: pointer;
      flex: none;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .icon-btn:hover {
      transform: rotate(90deg);
      background: #f3f6f6;
    }
    .icon-btn.back:hover {
      transform: none;
    }
    .icon-btn svg {
      width: 20px;
      height: 20px;
    }
    .flip svg {
      transform: scaleX(-1);
    }
    .content {
      overflow: auto;
      overscroll-behavior: contain;
      padding: 22px;
      flex: 1;
    }

    /* ---------- grid of products (3D tilt tiles) */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 18px;
    }
    .tile {
      --rx: 0deg;
      --ry: 0deg;
      position: relative;
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry));
      transition: transform 0.15s ease, box-shadow 0.2s ease;
      box-shadow: 0 6px 18px -12px rgba(0, 0, 0, 0.35);
      text-align: start;
      font: inherit;
      color: inherit;
      padding: 0;
      display: flex;
      flex-direction: column;
      animation: rise 0.5s both cubic-bezier(0.2, 0.9, 0.25, 1.1);
    }
    .tile:hover {
      box-shadow: 0 22px 40px -18px rgba(0, 0, 0, 0.45);
    }
    .tile .shine {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at var(--mx, 50%) var(--my, 0%),
        rgba(255, 255, 255, 0.45),
        transparent 45%
      );
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .tile:hover .shine {
      opacity: 1;
    }
    .tile .img {
      aspect-ratio: 1 / 1;
      background: #f2f5f5;
    }
    .tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .tile .info {
      padding: 12px 14px 14px;
      display: grid;
      gap: 4px;
    }
    .tile .name {
      font-weight: 700;
      font-size: 0.95rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .tile .qv {
      position: absolute;
      inset-block-start: 10px;
      inset-inline-end: 10px;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: perspective(800px) translateY(18px) rotateX(10deg);
      }
    }

    .prices {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }
    .price {
      font-weight: 800;
    }
    .old {
      color: var(--muted);
      text-decoration: line-through;
      font-size: 0.9em;
    }

    /* ---------- product quick view */
    .pv {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 28px;
      align-items: start;
    }
    .gallery {
      position: sticky;
      top: 0;
    }
    .main-img {
      --rx: 0deg;
      --ry: 0deg;
      position: relative;
      aspect-ratio: 1 / 1;
      border-radius: 20px;
      overflow: hidden;
      background: #f2f5f5;
      transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
      transition: transform 0.12s ease;
      box-shadow: 0 24px 50px -28px rgba(0, 0, 0, 0.55);
    }
    .main-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .thumbs {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      overflow-x: auto;
    }
    .thumbs button {
      width: 62px;
      height: 62px;
      flex: none;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      cursor: pointer;
      background: #f2f5f5;
    }
    .thumbs button[aria-current='true'] {
      border-color: var(--mw-primary);
    }
    .thumbs img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .pv h3 {
      margin: 0 0 6px;
      font-size: clamp(1.25rem, 2.6vw, 1.7rem);
      line-height: 1.35;
      font-weight: 800;
    }
    .promo {
      display: inline-block;
      color: var(--mw-primary);
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    .pv .prices {
      font-size: 1.35rem;
      margin: 10px 0 16px;
    }
    .desc {
      color: var(--muted);
      font-size: 0.95rem;
      max-height: 220px;
      overflow: auto;
      margin: 0 0 18px;
      padding-inline-end: 6px;
    }
    .desc img {
      max-width: 100%;
      height: auto;
    }
    .row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .qty {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 999px;
      overflow: hidden;
      direction: ltr;
    }
    .qty button {
      width: 44px;
      height: 48px;
      border: 0;
      background: #f3f6f6;
      font-size: 1.3rem;
      cursor: pointer;
      color: var(--ink);
    }
    .qty output {
      min-width: 44px;
      text-align: center;
      font-weight: 800;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 50px;
      padding: 12px 26px;
      border-radius: 999px;
      border: 2px solid var(--mw-primary);
      background: var(--mw-primary);
      color: var(--mw-on-primary);
      font: inherit;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      flex: 1;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px -12px color-mix(in srgb, var(--mw-primary) 80%, transparent);
    }
    .btn[disabled] {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .btn.ghost {
      background: transparent;
      color: var(--mw-primary);
    }
    .btn svg {
      width: 20px;
      height: 20px;
    }
    .note {
      background: color-mix(in srgb, var(--mw-primary) 8%, #ffffff);
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 14px;
      font-size: 0.92rem;
    }
    .success {
      display: grid;
      gap: 10px;
      background: #effaf3;
      border: 1px solid #bfe8cd;
      border-radius: 16px;
      padding: 14px;
      animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.25, 1.3);
    }
    .success strong {
      color: #126b3a;
    }
    @keyframes pop {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
    }
    .skel {
      background: linear-gradient(90deg, #eef2f2, #f8fafa, #eef2f2);
      background-size: 200% 100%;
      animation: sk 1.2s infinite linear;
      border-radius: 18px;
      aspect-ratio: 1 / 1.25;
    }
    @keyframes sk {
      to {
        background-position: -200% 0;
      }
    }
    .center {
      text-align: center;
      color: var(--muted);
      padding: 40px 0;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--mw-primary) 55%, #ffffff);
      outline-offset: 3px;
    }

    @media (max-width: 720px) {
      .panel {
        top: auto;
        bottom: 0;
        width: 100%;
        max-height: 90vh;
        border-radius: 24px 24px 0 0;
        transform: translateY(100%);
      }
      .open .panel {
        transform: none;
      }
      .closing .panel {
        transform: translateY(100%);
      }
      .content {
        padding: 16px;
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      }
      .pv {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .gallery {
        position: static;
      }
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      header {
        padding: 14px 16px;
      }
      header::before {
        content: '';
        position: absolute;
        top: 7px;
        inset-inline: 0;
        margin-inline: auto;
        width: 44px;
        height: 4px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.15);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
      .tile,
      .main-img {
        transform: none !important;
      }
    }
  `;
let y = N;
v([
  b()
], y.prototype, "opened");
v([
  b()
], y.prototype, "closing");
v([
  b()
], y.prototype, "view");
v([
  b()
], y.prototype, "products");
v([
  b()
], y.prototype, "current");
v([
  b()
], y.prototype, "loading");
v([
  b()
], y.prototype, "qty");
v([
  b()
], y.prototype, "imgIndex");
v([
  b()
], y.prototype, "busy");
v([
  b()
], y.prototype, "added");
v([
  b()
], y.prototype, "opts");
function dt(r, e) {
  return r.length === e.length && r.every((t, i) => String(t.id) === String(e[i]));
}
function pt() {
  var e;
  let r = document.activeElement;
  for (; r && ((e = r.shadowRoot) != null && e.activeElement); ) r = r.shadowRoot.activeElement;
  return r;
}
function ft(r) {
  customElements.get(T) || customElements.define(T, y);
  let e = document.querySelector(T);
  e || (e = document.createElement(T), document.body.appendChild(e)), e.show(r);
}
var ut = Object.defineProperty, mt = (r, e, t, i) => {
  for (var s = void 0, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (s = n(e, t, s) || s);
  return s && ut(e, t, s), s;
};
const F = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
function gt(r) {
  let e, t, i;
  const s = r.trim();
  if (F.test(s)) {
    let n = s.slice(1);
    n.length === 3 && (n = n.split("").map((a) => a + a).join("")), e = parseInt(n.slice(0, 2), 16), t = parseInt(n.slice(2, 4), 16), i = parseInt(n.slice(4, 6), 16);
  } else {
    const n = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!n) return NaN;
    [e, t, i] = [Number(n[1]), Number(n[2]), Number(n[3])];
  }
  const o = (n) => {
    const a = n / 255;
    return a <= 0.03928 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * o(e) + 0.7152 * o(t) + 0.0722 * o(i);
}
const K = "#mawsim-products";
class yt extends X {
  constructor() {
    super(...arguments), this.defaultTone = "auto", this.onAnchorClick = (e) => {
      const i = e.composedPath().find((a) => a instanceof HTMLAnchorElement);
      if (!i || i.getAttribute("href") !== K) return;
      e.preventDefault();
      const s = ot();
      if (G(this.c.cta_action, "board") === "board" && s) {
        ft({
          ids: s.ids,
          title: s.title,
          subtitle: s.subtitle,
          scene: s.scene,
          accent: s.accent
        });
        return;
      }
      const o = Array.from(document.querySelectorAll("*")).find(
        (a) => a.tagName.toLowerCase().startsWith("salla-mawsim-product-spotlight")
      ), n = D() ? "auto" : "smooth";
      o ? o.scrollIntoView({ behavior: n, block: "start" }) : window.scrollBy({ top: window.innerHeight * 0.85, behavior: n });
    }, this.contrastChecked = !1;
  }
  get c() {
    return this.config || {};
  }
  /** Link for a call-to-action button. Empty → open the products board / scroll to products. */
  ctaHref(e) {
    return tt(e) || K;
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("click", this.onAnchorClick);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("click", this.onAnchorClick);
  }
  willUpdate(e) {
    if (super.willUpdate(e), !e.has("config") && this.hasUpdated) return;
    const t = G(this.c.tone, this.defaultTone);
    t && t !== "auto" ? this.setAttribute("data-tone", t) : this.removeAttribute("data-tone");
    const i = q(this.c.accent_color).trim();
    F.test(i) ? this.style.setProperty("--mw-accent", i) : this.style.removeProperty("--mw-accent");
  }
  updated(e) {
    super.updated(e), (e.has("config") || !this.contrastChecked) && this.fixContrast();
  }
  /**
   * Keeps text readable whatever color the store uses:
   * - very dark accent on a dark section → use white as the accent
   * - very light accent (e.g. yellow) → dark text on buttons
   */
  fixContrast() {
    this.contrastChecked = !0, this.style.removeProperty("--mw-primary"), this.style.removeProperty("--mw-on-primary");
    const e = getComputedStyle(this), t = q(this.c.accent_color).trim(), i = F.test(t) ? t : e.getPropertyValue("--color-primary").trim() || e.getPropertyValue("--primary").trim() || "#0f766e", s = gt(i);
    if (!Number.isFinite(s)) return;
    this.getAttribute("data-tone") === "dark" && s < 0.08 ? (this.style.setProperty("--mw-primary", "#ffffff"), this.style.setProperty("--mw-on-primary", "#111111")) : s > 0.55 && this.style.setProperty("--mw-on-primary", "#13201f");
  }
}
mt([
  Q({ type: Object })
], yt.prototype, "config");
export {
  ct as F,
  yt as M,
  P as a,
  Mt as b,
  f as c,
  D as d,
  R as e,
  $t as f,
  wt as g,
  et as h,
  E as i,
  it as j,
  B as k,
  kt as l,
  H as m,
  Z as n,
  ft as o,
  G as p,
  S as q,
  St as r,
  tt as s,
  q as t
};
