import { css as v, nothing as a, html as e } from "lit";
import { M as x, b as h, t as s, l as y, s as $, i as w } from "./base-DhvH5e79.js";
import { b as f } from "./styles-BrSr9s7o.js";
const p = class p extends x {
  /** Keep only one item open when "one at a time" is on. */
  onToggle(t) {
    if (!h(this.c.single_open, !0)) return;
    const r = t.target;
    r.open && this.renderRoot.querySelectorAll("details").forEach((o) => {
      o !== r && (o.open = !1);
    });
  }
  render() {
    const t = this.c, r = s(t.eyebrow), o = s(t.title), c = s(t.subtitle), g = y(t.items).filter((i) => s(i == null ? void 0 : i.question)), b = h(t.open_first, !0), l = s(t.contact_text), d = s(t.contact_label), m = $(t.contact_link);
    return e`<section class="mw-section">
      <div class="mw-container">
        ${o || c || r ? e`<header class="mw-head">
              ${r ? e`<span class="mw-eyebrow">${r}</span>` : a}
              ${o ? e`<h2 class="mw-title">${o}</h2>` : a}
              ${c ? e`<p class="mw-sub">${c}</p>` : a}
            </header>` : a}
        <div class="list">
          ${g.map(
      (i, u) => e`<details ?open=${b && u === 0} @toggle=${this.onToggle}>
              <summary>
                <span>${s(i.question)}</span>
                <span class="chev" aria-hidden="true">${w("chevron")}</span>
              </summary>
              <div class="answer">${s(i.answer)}</div>
            </details>`
    )}
        </div>
        ${l || d && m ? e`<div class="contact">
              ${l ? e`<div>${l}</div>` : a}
              ${d && m ? e`<a class="mw-btn mw-btn--ghost" href=${m}>${w("chat")} ${d}</a>` : a}
            </div>` : a}
      </div>
    </section>`;
  }
};
p.styles = [
  f,
  v`
      .list {
        max-width: 820px;
        margin-inline: auto;
        display: grid;
        gap: 12px;
      }
      details {
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius-sm);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      details[open] {
        border-color: color-mix(in srgb, var(--mw-primary) 50%, transparent);
        box-shadow: var(--mw-shadow);
      }
      summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 20px;
        font-weight: 700;
        font-size: 1.02rem;
        border-radius: var(--mw-radius-sm);
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .chev {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--mw-primary) 12%, transparent);
        color: var(--mw-primary);
        flex: none;
        transition: transform 0.2s ease;
      }
      :host([data-tone='primary']) .chev,
      :host([data-tone='dark']) .chev {
        background: rgba(255, 255, 255, 0.14);
        color: var(--mw-ink);
      }
      .chev .mw-icon {
        width: 18px;
        height: 18px;
      }
      details[open] .chev {
        transform: rotate(180deg);
      }
      .answer {
        padding: 0 20px 20px;
        color: var(--mw-muted);
        white-space: pre-line;
        line-height: 1.8;
      }
      .contact {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
        color: var(--mw-muted);
      }
      .contact .mw-btn {
        margin-top: 12px;
      }
    `
];
let n = p;
typeof n < "u" && n.registerSallaComponent("salla-mawsim-faq");
export {
  n as default
};
