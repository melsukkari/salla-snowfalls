import { css as v, nothing as r, html as s } from "lit";
import { state as h } from "lit/decorators.js";
import { M as $, n as y, t as o, b as w, p as k, i as f, c as _ } from "./base-DhvH5e79.js";
import { b as V } from "./styles-BrSr9s7o.js";
var z = Object.defineProperty, x = (b, e, i, n) => {
  for (var t = void 0, a = b.length - 1, c; a >= 0; a--)
    (c = b[a]) && (t = c(e, i, t) || t);
  return t && z(e, i, t), t;
};
const p = class p extends $ {
  constructor() {
    super(...arguments), this.defaultTone = "primary", this.barVisible = !1, this.dismissed = !1, this.onScroll = () => {
      const e = y(this.c.show_after, 600), i = this.renderRoot.querySelector(".banner");
      let n = !1;
      if (i) {
        const t = i.getBoundingClientRect();
        n = t.top < window.innerHeight && t.bottom > 0;
      }
      this.barVisible = window.scrollY > e && !n;
    };
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("scroll", this.onScroll, { passive: !0 });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("scroll", this.onScroll);
  }
  render() {
    const e = this.c, i = o(e.eyebrow), n = o(e.title, "جاهز تبدأ؟"), t = o(e.subtitle), a = o(e.cta_label, "تسوّق الآن"), c = this.ctaHref(e.cta_link), d = o(e.note), u = w(e.sticky_bar, !0), m = o(e.bar_text, n), g = k(e.mode, "both") !== "bar";
    return s`
      ${g ? s`<section class="mw-section">
            <div class="mw-container banner">
              ${i ? s`<span class="mw-eyebrow">${i}</span>` : r}
              <h2 class="mw-title">${n}</h2>
              ${t ? s`<p class="mw-sub">${t}</p>` : r}
              <div class="actions"><a class="mw-btn" href=${c}>${a} ${f("arrow", "mw-icon mw-flip")}</a></div>
              ${d ? s`<p class="note">${d}</p>` : r}
            </div>
          </section>` : r}
      ${u && !this.dismissed ? s`<div class="bar ${this.barVisible ? "show" : ""}" role="region" aria-label=${m}
            aria-hidden=${this.barVisible ? "false" : "true"}>
            <span class="text">${m}</span>
            <a class="mw-btn" href=${c} tabindex=${this.barVisible ? "0" : "-1"}>${a}</a>
            ${w(e.dismissible, !0) ? s`<button class="close" type="button" aria-label=${_("close")}
                  tabindex=${this.barVisible ? "0" : "-1"} @click=${() => this.dismissed = !0}>
                  ${f("x")}
                </button>` : r}
          </div>` : r}
    `;
  }
};
p.styles = [
  V,
  v`
      .banner {
        text-align: center;
        max-width: 820px;
        margin-inline: auto;
      }
      .banner .mw-title {
        font-size: clamp(1.6rem, 3.6vw, 2.6rem);
      }
      .banner .actions {
        margin-top: 26px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
      }
      .banner .mw-btn {
        min-width: 220px;
        min-height: 54px;
        font-size: 1.08rem;
      }
      .note {
        margin-top: 14px;
        font-size: 0.9rem;
        color: var(--mw-muted);
      }

      .bar {
        position: fixed;
        inset-inline: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        z-index: 60;
        max-width: 760px;
        margin-inline: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding-block: 10px;
        padding-inline-start: 18px;
        padding-inline-end: 10px;
        border-radius: 999px;
        background: #13201f;
        color: #ffffff;
        box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.45);
        transform: translateY(140%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        pointer-events: none;
      }
      .bar.show {
        transform: none;
        opacity: 1;
        pointer-events: auto;
      }
      .bar .text {
        flex: 1;
        min-width: 0;
        font-weight: 700;
        font-size: 0.95rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bar .mw-btn {
        min-height: 42px;
        padding: 8px 20px;
        background: var(--mw-primary);
        color: var(--mw-on-primary);
        border-color: var(--mw-primary);
        white-space: nowrap;
      }
      .close {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        cursor: pointer;
        flex: none;
      }
      .close .mw-icon {
        width: 16px;
        height: 16px;
      }
      @media (max-width: 520px) {
        .bar .text {
          font-size: 0.85rem;
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .banner .mw-btn {
          width: 100%;
        }
      }
    `
];
let l = p;
x([
  h()
], l.prototype, "barVisible");
x([
  h()
], l.prototype, "dismissed");
typeof l < "u" && l.registerSallaComponent("salla-mawsim-sticky-cta");
export {
  l as default
};
