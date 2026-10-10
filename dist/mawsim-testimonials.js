import { css as b, html as a, nothing as r } from "lit";
import { M as $, i as u, t as i, l as k, b as S, n as w, a as f, f as q } from "./base-DhvH5e79.js";
import { b as z } from "./styles-BrSr9s7o.js";
const m = class m extends $ {
  stars(s) {
    const e = Math.round(Math.min(5, Math.max(0, s)));
    return a`<span class="stars" aria-label="${e} / 5">
      ${[1, 2, 3, 4, 5].map((o) => a`<span class=${o <= e ? "on" : "off"}>${u("star")}</span>`)}
    </span>`;
  }
  render() {
    const s = this.c, e = i(s.eyebrow), o = i(s.title), p = i(s.subtitle), n = k(s.items).filter((t) => i(t == null ? void 0 : t.text)), y = S(s.show_summary, !0), d = n.length ? n.reduce((t, l) => t + w(l.rating, 5), 0) / n.length : 0, g = i(s.summary_text), v = d.toLocaleString(f() === "ar" ? "ar-SA" : "en-US", { maximumFractionDigits: 1 });
    return a`<section class="mw-section">
      <div class="mw-container">
        <header class="mw-head">
          ${e ? a`<span class="mw-eyebrow">${e}</span>` : r}
          ${o ? a`<h2 class="mw-title">${o}</h2>` : r}
          ${p ? a`<p class="mw-sub">${p}</p>` : r}
          ${y && n.length ? a`<div class="summary">${this.stars(d)} <span>${v}</span>
                ${g ? a`<span>· ${g}</span>` : r}</div>` : r}
        </header>
        <div class="track" role="list">
          ${n.map((t) => {
      const l = i(t.name, f() === "ar" ? "عميل" : "Customer"), h = q(t.avatar), x = i(t.city);
      return a`<figure class="card" role="listitem">
              ${this.stars(w(t.rating, 5))}
              <blockquote>${i(t.text)}</blockquote>
              <figcaption class="who">
                ${h ? a`<img class="avatar" src=${h} alt="" loading="lazy" decoding="async" />` : a`<span class="initial" aria-hidden="true">${l.trim().charAt(0)}</span>`}
                <span>
                  <span class="name">${l}</span>
                  ${x ? a`<span class="city">${u("check")} ${x}</span>` : r}
                </span>
              </figcaption>
            </figure>`;
    })}
        </div>
      </div>
    </section>`;
  }
};
m.styles = [
  z,
  b`
      .summary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-top: 14px;
        padding: 8px 16px;
        border-radius: 999px;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        font-weight: 700;
      }
      .stars {
        display: inline-flex;
        gap: 2px;
        color: #f5a524;
      }
      .stars .mw-icon {
        width: 18px;
        height: 18px;
      }
      .stars .on svg {
        fill: currentColor;
      }
      .stars .off {
        opacity: 0.3;
      }
      .track {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: calc((100% - 2 * var(--mw-gap)) / 3);
        gap: var(--mw-gap);
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 12px;
        scrollbar-width: thin;
      }
      .card {
        scroll-snap-align: start;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        padding: clamp(18px, 2.4vw, 26px);
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: var(--mw-shadow);
      }
      blockquote {
        margin: 0;
        font-size: 1rem;
        line-height: 1.75;
        flex: 1;
      }
      .who {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        flex: none;
      }
      .initial {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: color-mix(in srgb, var(--mw-primary) 14%, transparent);
        color: var(--mw-primary);
        font-weight: 800;
        flex: none;
      }
      :host([data-tone='primary']) .initial,
      :host([data-tone='dark']) .initial {
        background: rgba(255, 255, 255, 0.14);
        color: var(--mw-ink);
      }
      .name {
        font-weight: 800;
        display: block;
      }
      .city {
        font-size: 0.85rem;
        color: var(--mw-muted);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .city .mw-icon {
        width: 14px;
        height: 14px;
        color: var(--mw-primary);
      }
      @media (max-width: 900px) {
        .track {
          grid-auto-columns: calc((100% - var(--mw-gap)) / 2);
        }
      }
      @media (max-width: 560px) {
        .track {
          grid-auto-columns: 86%;
        }
      }
    `
];
let c = m;
typeof c < "u" && c.registerSallaComponent("salla-mawsim-testimonials");
export {
  c as default
};
