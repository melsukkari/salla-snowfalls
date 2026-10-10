import { css as x, nothing as i, html as r } from "lit";
import { M as h, t as a, l as w, p as l, i as u } from "./base-DhvH5e79.js";
import { b as v } from "./styles-BrSr9s7o.js";
const c = class c extends h {
  render() {
    const e = this.c, o = a(e.eyebrow), n = a(e.title), m = a(e.subtitle), d = w(e.items).filter((t) => a(t == null ? void 0 : t.title) || a(t == null ? void 0 : t.text)), p = Math.min(4, Math.max(2, parseInt(l(e.columns, "3"), 10) || 3)), g = l(e.align, "start");
    return r`<section class="mw-section">
      <div class="mw-container">
        ${n || m || o ? r`<header class="mw-head">
              ${o ? r`<span class="mw-eyebrow">${o}</span>` : i}
              ${n ? r`<h2 class="mw-title">${n}</h2>` : i}
              ${m ? r`<p class="mw-sub">${m}</p>` : i}
            </header>` : i}
        <div class="grid ${g === "center" ? "centered" : ""}" style="--cols:${p}">
          ${d.map(
      (t) => r`<div class="item">
              <span class="ico">${u(l(t.icon, "check"))}</span>
              ${a(t.title) ? r`<h3>${a(t.title)}</h3>` : i}
              ${a(t.text) ? r`<p>${a(t.text)}</p>` : i}
            </div>`
    )}
        </div>
      </div>
    </section>`;
  }
};
c.styles = [
  v,
  x`
      .grid {
        display: grid;
        gap: var(--mw-gap);
        grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
      }
      .item {
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        padding: clamp(20px, 2.6vw, 28px);
        text-align: start;
        transition: border-color 0.2s ease, transform 0.2s ease;
      }
      .item:hover {
        border-color: color-mix(in srgb, var(--mw-primary) 45%, transparent);
        transform: translateY(-2px);
      }
      .ico {
        display: inline-grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--mw-primary) 12%, transparent);
        color: var(--mw-primary);
        margin-bottom: 14px;
      }
      :host([data-tone='primary']) .ico,
      :host([data-tone='dark']) .ico {
        background: rgba(255, 255, 255, 0.12);
        color: var(--mw-ink);
      }
      .ico .mw-icon {
        width: 26px;
        height: 26px;
      }
      h3 {
        margin: 0 0 6px;
        font-size: 1.08rem;
        font-weight: 800;
      }
      p {
        margin: 0;
        color: var(--mw-muted);
        font-size: 0.96rem;
      }
      .centered .item {
        text-align: center;
      }
      @media (max-width: 900px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 520px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .item {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0 14px;
          align-items: start;
          text-align: start !important;
        }
        .ico {
          grid-row: span 2;
          margin: 0;
        }
      }
    `
];
let s = c;
typeof s < "u" && s.registerSallaComponent("salla-mawsim-benefits");
export {
  s as default
};
