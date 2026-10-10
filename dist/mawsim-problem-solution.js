import { css as v, nothing as s, html as i } from "lit";
import { M as f, t as r, l as d, f as x, i as e } from "./base-DhvH5e79.js";
import { b } from "./styles-BrSr9s7o.js";
const c = class c extends f {
  render() {
    const t = this.c, l = r(t.title), n = r(t.subtitle), g = d(t.problems).map((a) => r(a == null ? void 0 : a.text)).filter(Boolean), w = d(t.solutions).map((a) => r(a == null ? void 0 : a.text)).filter(Boolean), m = x(t.image), p = r(t.cta_label), h = this.ctaHref(t.cta_link), u = getComputedStyle(this).direction === "rtl";
    return i`<section class="mw-section">
      <div class="mw-container">
        ${l || n ? i`<header class="mw-head">
              ${l ? i`<h2 class="mw-title">${l}</h2>` : s}
              ${n ? i`<p class="mw-sub">${n}</p>` : s}
            </header>` : s}
        <div class="cols">
          <div class="panel problem">
            <h3><span class="tag">${e("x")}</span>${r(t.problem_title, "المشكلة")}</h3>
            <ul>
              ${g.map((a) => i`<li>${e("x")}<span>${a}</span></li>`)}
            </ul>
          </div>
          <div class="arrow ${u ? "rtl" : ""}" aria-hidden="true">${e("arrow")}</div>
          <div class="panel solution">
            <h3><span class="tag">${e("check")}</span>${r(t.solution_title, "الحل")}</h3>
            <ul>
              ${w.map((a) => i`<li>${e("check")}<span>${a}</span></li>`)}
            </ul>
          </div>
        </div>
        ${m ? i`<div class="image"><img src=${m} alt=${l} loading="lazy" decoding="async" /></div>` : s}
        ${p ? i`<div class="cta"><a class="mw-btn" href=${h}>${p}</a></div>` : s}
      </div>
    </section>`;
  }
};
c.styles = [
  b,
  v`
      .cols {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: var(--mw-gap);
        align-items: stretch;
      }
      .panel {
        border-radius: var(--mw-radius);
        padding: clamp(20px, 3vw, 32px);
        border: 1px solid var(--mw-line);
        background: var(--mw-card);
      }
      .panel.solution {
        border: 2px solid var(--mw-primary);
        box-shadow: var(--mw-shadow);
      }
      .panel h3 {
        margin: 0 0 16px;
        font-size: 1.2rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .tag {
        display: inline-grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        flex: none;
      }
      .problem .tag {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
      }
      .solution .tag {
        background: color-mix(in srgb, var(--mw-primary) 14%, transparent);
        color: var(--mw-primary);
      }
      :host([data-tone='primary']) .solution .tag,
      :host([data-tone='dark']) .solution .tag {
        color: var(--mw-ink);
      }
      .tag .mw-icon {
        width: 18px;
        height: 18px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
      }
      li {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
      li .mw-icon {
        width: 20px;
        height: 20px;
        margin-top: 3px;
      }
      .problem li {
        color: var(--mw-muted);
      }
      .problem li .mw-icon {
        color: #dc2626;
      }
      .solution li .mw-icon {
        color: var(--mw-primary);
      }
      :host([data-tone='primary']) li .mw-icon,
      :host([data-tone='dark']) li .mw-icon {
        color: var(--mw-ink);
      }
      .arrow {
        align-self: center;
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--mw-primary);
        color: var(--mw-on-primary);
      }
      .arrow.rtl svg {
        transform: scaleX(-1);
      }
      .image {
        margin-top: var(--mw-gap);
      }
      .image img {
        width: 100%;
        max-height: 420px;
        object-fit: cover;
        border-radius: var(--mw-radius);
      }
      .cta {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
      }
      @media (max-width: 820px) {
        .cols {
          grid-template-columns: 1fr;
        }
        .arrow {
          justify-self: center;
          transform: rotate(90deg);
        }
        .arrow.rtl svg {
          transform: none;
        }
      }
    `
];
let o = c;
typeof o < "u" && o.registerSallaComponent("salla-mawsim-problem-solution");
export {
  o as default
};
