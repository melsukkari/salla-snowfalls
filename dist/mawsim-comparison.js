import { css as x, html as t, nothing as i } from "lit";
import { M as g, i as h, t as s, l as v, b as w } from "./base-DhvH5e79.js";
import { b as y } from "./styles-BrSr9s7o.js";
const p = class p extends g {
  mark(a, o, e) {
    return a ? t`<span class="yes">${h("check")}</span><span class="sr">${o}</span>` : t`<span class="no">${h("x")}</span><span class="sr">${e}</span>`;
  }
  render() {
    const a = this.c, o = s(a.eyebrow), e = s(a.title), l = s(a.subtitle), n = s(a.us_label, "متجرنا"), d = s(a.them_label, "الخيارات الأخرى"), b = v(a.rows).filter((r) => s(r == null ? void 0 : r.feature)), m = s(a.cta_label), u = this.ctaHref(a.cta_link);
    return t`<section class="mw-section">
      <div class="mw-container">
        ${e || l || o ? t`<header class="mw-head">
              ${o ? t`<span class="mw-eyebrow">${o}</span>` : i}
              ${e ? t`<h2 class="mw-title">${e}</h2>` : i}
              ${l ? t`<p class="mw-sub">${l}</p>` : i}
            </header>` : i}
        <div class="wrap">
          <table>
            <thead>
              <tr>
                <th scope="col"><span class="sr">${e}</span></th>
                <th scope="col" class="col us">${n}</th>
                <th scope="col" class="col">${d}</th>
              </tr>
            </thead>
            <tbody>
              ${b.map(
      (r) => t`<tr>
                  <td class="feature">${s(r.feature)}</td>
                  <td class="col us">${this.mark(w(r.us, !0), n, n)}</td>
                  <td class="col">${this.mark(w(r.them, !1), d, d)}</td>
                </tr>`
    )}
            </tbody>
          </table>
        </div>
        ${m ? t`<div class="cta"><a class="mw-btn" href=${u}>${m}</a></div>` : i}
      </div>
    </section>`;
  }
};
p.styles = [
  y,
  x`
      .wrap {
        max-width: 860px;
        margin-inline: auto;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        overflow: hidden;
        box-shadow: var(--mw-shadow);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 14px clamp(12px, 2.4vw, 22px);
        border-bottom: 1px solid var(--mw-line);
        text-align: start;
      }
      tr:last-child td {
        border-bottom: 0;
      }
      thead th {
        font-size: 0.95rem;
        font-weight: 800;
        background: color-mix(in srgb, var(--mw-primary) 6%, transparent);
      }
      th.col,
      td.col {
        text-align: center;
        width: 24%;
      }
      th.us {
        background: var(--mw-primary);
        color: var(--mw-on-primary);
      }
      td.us {
        background: color-mix(in srgb, var(--mw-primary) 7%, transparent);
      }
      :host([data-tone='primary']) th.us {
        background: var(--mw-on-primary);
        color: var(--mw-primary);
      }
      td.feature {
        font-weight: 600;
      }
      .yes,
      .no {
        display: inline-grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      .yes {
        background: var(--mw-primary);
        color: var(--mw-on-primary);
      }
      :host([data-tone='primary']) .yes {
        background: var(--mw-on-primary);
        color: var(--mw-primary);
      }
      .no {
        background: rgba(127, 127, 127, 0.15);
        color: var(--mw-muted);
      }
      .yes .mw-icon,
      .no .mw-icon {
        width: 16px;
        height: 16px;
      }
      .cta {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
      }
      .sr {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
      @media (max-width: 520px) {
        th,
        td {
          padding: 12px 10px;
          font-size: 0.9rem;
        }
      }
    `
];
let c = p;
typeof c < "u" && c.registerSallaComponent("salla-mawsim-comparison");
export {
  c as default
};
