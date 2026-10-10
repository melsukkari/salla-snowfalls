import { css as c, nothing as r, html as a } from "lit";
import { M as p, t as e, l as m, i as d, p as g } from "./base-DhvH5e79.js";
import { b as x } from "./styles-BrSr9s7o.js";
const i = class i extends p {
  constructor() {
    super(...arguments), this.defaultTone = "tint";
  }
  render() {
    const o = this.c, n = e(o.title), l = m(o.items).filter((t) => e(t == null ? void 0 : t.title));
    return a`<section class="mw-section">
      <div class="mw-container">
        ${n ? a`<p class="title">${n}</p>` : r}
        <div class="row">
          ${l.map(
      (t) => a`<div class="badge">
              <span class="ico">${d(g(t.icon, "shield"))}</span>
              <span>
                <strong>${e(t.title)}</strong>
                ${e(t.text) ? a`<span class="t">${e(t.text)}</span>` : r}
              </span>
            </div>`
    )}
        </div>
      </div>
    </section>`;
  }
};
i.styles = [
  x,
  c`
      .mw-section {
        padding-block: clamp(28px, 5vw, 52px);
      }
      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 14px var(--mw-gap);
      }
      .badge {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .ico {
        display: grid;
        place-items: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--mw-surface);
        color: var(--mw-primary);
        box-shadow: var(--mw-shadow);
        flex: none;
      }
      :host([data-tone='primary']) .ico {
        background: rgba(255, 255, 255, 0.14);
        color: var(--mw-ink);
        box-shadow: none;
      }
      strong {
        display: block;
        font-weight: 800;
        line-height: 1.35;
      }
      span.t {
        display: block;
        font-size: 0.88rem;
        color: var(--mw-muted);
      }
      .title {
        text-align: center;
        font-weight: 800;
        font-size: 1.15rem;
        margin: 0 0 22px;
      }
      @media (max-width: 520px) {
        .row {
          grid-template-columns: 1fr 1fr;
        }
        .badge {
          flex-direction: column;
          text-align: center;
          gap: 8px;
        }
      }
    `
];
let s = i;
typeof s < "u" && s.registerSallaComponent("salla-mawsim-trust-badges");
export {
  s as default
};
