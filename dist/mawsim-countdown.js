import { css as g, nothing as c, html as s } from "lit";
import { state as x } from "lit/decorators.js";
import { M as y, t as o, a as k, b, c as p, i as $ } from "./base-DhvH5e79.js";
import { b as _ } from "./styles-BrSr9s7o.js";
var C = Object.defineProperty, T = (f, t, e, n) => {
  for (var i = void 0, r = f.length - 1, a; r >= 0; r--)
    (a = f[r]) && (i = a(t, e, i) || i);
  return i && C(t, e, i), i;
};
const h = class h extends y {
  constructor() {
    super(...arguments), this.defaultTone = "primary", this.remaining = 0, this.tick = () => {
      const t = this.endTime();
      this.remaining = Number.isFinite(t) ? Math.max(0, t - Date.now()) : 0, this.remaining <= 0 && this.timer && (clearInterval(this.timer), this.timer = void 0);
    };
  }
  endTime() {
    const t = o(this.c.end_datetime).trim();
    return t ? new Date(t.replace(" ", "T")).getTime() : NaN;
  }
  connectedCallback() {
    super.connectedCallback(), this.start();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.timer && clearInterval(this.timer), this.timer = void 0;
  }
  willUpdate(t) {
    super.willUpdate(t), t.has("config") && this.isConnected && this.start();
  }
  start() {
    this.timer && clearInterval(this.timer), this.tick(), this.remaining > 0 && (this.timer = window.setInterval(this.tick, 1e3));
  }
  fmt(t) {
    const e = String(t).padStart(2, "0");
    return k() === "ar" && b(this.c.arabic_digits, !1) ? e.replace(/\d/g, (n) => "٠١٢٣٤٥٦٧٨٩"[Number(n)]) : e;
  }
  render() {
    const t = this.c, e = o(t.title, "العرض ينتهي قريباً"), n = o(t.subtitle), i = o(t.cta_label), r = this.ctaHref(t.cta_link), a = Number.isFinite(this.endTime()), l = a && this.remaining <= 0;
    if (l && b(t.hide_when_expired, !1)) return c;
    const d = Math.floor(this.remaining / 1e3), u = [
      { v: Math.floor(d / 86400), l: p("days") },
      { v: Math.floor(d % 86400 / 3600), l: p("hours") },
      { v: Math.floor(d % 3600 / 60), l: p("minutes") },
      { v: d % 60, l: p("seconds") }
    ], w = getComputedStyle(this).direction === "rtl" ? [...u].reverse() : u;
    return s`<section class="mw-section" aria-live="off">
      <div class="mw-container bar">
        <div class="copy">
          ${$("clock")}
          <div>
            <p class="title">${l ? o(t.expired_text, "انتهى العرض") : e}</p>
            ${n && !l ? s`<p class="sub">${n}</p>` : c}
          </div>
        </div>
        ${a && !l ? s`<div class="clock" role="timer" aria-label=${e}>
              ${w.map(
      (v) => s`<div class="unit">
                  <span class="num">${this.fmt(v.v)}</span><span class="lbl">${v.l}</span>
                </div>`
    )}
            </div>` : c}
        ${a ? c : s`<div class="mw-empty">حدد تاريخ ووقت نهاية العرض</div>`}
        ${i && !l ? s`<a class="mw-btn" href=${r}>${i}</a>` : c}
      </div>
    </section>`;
  }
};
h.styles = [
  _,
  g`
      .mw-section {
        padding-block: clamp(22px, 4vw, 40px);
      }
      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 18px 28px;
      }
      .copy {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }
      .copy .mw-icon {
        width: 34px;
        height: 34px;
        opacity: 0.9;
      }
      .title {
        font-size: clamp(1.1rem, 2.2vw, 1.45rem);
        font-weight: 800;
        margin: 0;
        line-height: 1.3;
      }
      .sub {
        margin: 2px 0 0;
        color: var(--mw-muted);
        font-size: 0.95rem;
      }
      .clock {
        display: flex;
        gap: 10px;
        direction: ltr;
      }
      .unit {
        min-width: 68px;
        text-align: center;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius-sm);
        padding: 10px 8px 8px;
      }
      :host(:not([data-tone])) .unit,
      :host([data-tone='tint']) .unit {
        box-shadow: var(--mw-shadow);
      }
      .num {
        display: block;
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 800;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .lbl {
        display: block;
        margin-top: 6px;
        font-size: 0.75rem;
        color: var(--mw-muted);
      }
      .expired {
        font-weight: 700;
      }
      @media (max-width: 640px) {
        .bar {
          justify-content: center;
          text-align: center;
        }
        .copy {
          flex-direction: column;
        }
        .clock {
          width: 100%;
          justify-content: center;
        }
        .unit {
          flex: 1;
          min-width: 0;
        }
        .bar .mw-btn {
          width: 100%;
        }
      }
    `
];
let m = h;
T([
  x()
], m.prototype, "remaining");
typeof m < "u" && m.registerSallaComponent("salla-mawsim-countdown");
export {
  m as default
};
