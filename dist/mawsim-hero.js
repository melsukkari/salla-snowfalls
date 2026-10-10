import { css as w, nothing as a, html as t, svg as l } from "lit";
import { M as u, p as m, F as x, e as y, t as r, s as b, f as $ } from "./base-DhvH5e79.js";
import { b as k } from "./styles-BrSr9s7o.js";
function C(f) {
  switch (f) {
    case "crescent":
      return l`<g fill="currentColor">
        <path d="M410 70a90 90 0 1 0 80 132 72 72 0 1 1-80-132z" opacity=".9"/>
        <path d="M520 60l6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z" opacity=".8"/>
        <path d="M90 50l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" opacity=".55"/>
        <path d="M560 210l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" opacity=".6"/>
        <line x1="300" y1="0" x2="300" y2="70" stroke="currentColor" stroke-width="2" opacity=".5"/>
        <path d="M285 70h30l-4 30h-22z" opacity=".55"/><circle cx="300" cy="112" r="10" opacity=".45"/>
      </g>`;
    case "geometric":
      return l`<g fill="none" stroke="currentColor" stroke-width="2" opacity=".75">
        ${[80, 230, 380, 530].map(
        (e) => l`<g transform="translate(${e} 110)"><rect x="-46" y="-46" width="92" height="92"/><rect x="-46" y="-46" width="92" height="92" transform="rotate(45)"/><circle r="22"/></g>`
      )}
      </g>`;
    case "sparkle":
      return l`<g fill="currentColor">
        ${[
        [70, 60, 1],
        [180, 170, 0.6],
        [300, 50, 0.8],
        [420, 160, 1.2],
        [540, 70, 0.7]
      ].map(
        ([e, s, o]) => l`<path transform="translate(${e} ${s}) scale(${o})" d="M0-34C4-8 8-4 34 0 8 4 4 8 0 34-4 8-8 4-34 0-8-4-4-8 0-34z"/>`
      )}
      </g>`;
    case "waves":
      return l`<g fill="none" stroke="currentColor" stroke-width="2.5" opacity=".8">
        ${[40, 80, 120, 160, 200].map(
        (e) => l`<path d="M0 ${e} C100 ${e - 30} 200 ${e + 30} 300 ${e} S500 ${e - 30} 600 ${e}"/>`
      )}
      </g>`;
    default:
      return a;
  }
}
const v = class v extends u {
  constructor() {
    super(...arguments), this.sceneKey = "";
  }
  sceneKind() {
    return m(this.c.scene, "none");
  }
  updated(e) {
    super.updated(e), this.syncScene();
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this.scene) == null || e.destroy(), this.scene = void 0, this.sceneCanvas = void 0, this.sceneKey = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.hasUpdated && this.syncScene();
  }
  /** Create / update / remove the festive canvas to match the settings. */
  syncScene() {
    var p, h;
    const e = this.renderRoot.querySelector("canvas.scene"), s = this.sceneKind();
    if (!e || s === "none") {
      (p = this.scene) == null || p.destroy(), this.scene = void 0, this.sceneCanvas = void 0, this.sceneKey = "";
      return;
    }
    const o = this.getAttribute("data-tone"), c = getComputedStyle(this).getPropertyValue("--mw-primary").trim() || "#0f766e", i = parseFloat(m(this.c.scene_density, "1")) || 1, d = !o || o === "tint", n = [s, c, i, d].join("|");
    this.scene && this.sceneCanvas === e ? n !== this.sceneKey && this.scene.update({ kind: s, accent: c, density: i, onLight: d }) : ((h = this.scene) == null || h.destroy(), this.scene = new x(e, {
      kind: s,
      accent: c,
      density: i,
      onLight: d,
      rtl: y(),
      pointerTarget: this
    }), this.sceneCanvas = e), this.sceneKey = n;
  }
  renderCopy() {
    const e = this.c, s = r(e.eyebrow), o = r(e.title, "عنوان واضح يشرح القيمة في سطر واحد"), c = r(e.subtitle), i = r(e.cta_label), d = this.ctaHref(e.cta_link), n = r(e.secondary_label), p = b(e.secondary_link), h = r(e.note);
    return t`<div class="copy">
      ${s ? t`<span class="mw-eyebrow">${s}</span>` : a}
      <h1 class="mw-title">${o}</h1>
      ${c ? t`<p class="mw-sub">${c}</p>` : a}
      ${i || n && p ? t`<div class="actions">
            ${i ? t`<a class="mw-btn" href=${d}>${i}</a>` : a}
            ${n && p ? t`<a class="mw-btn mw-btn--ghost" href=${p}>${n}</a>` : a}
          </div>` : a}
      ${h ? t`<p class="note">${h}</p>` : a}
    </div>`;
  }
  render() {
    const e = m(this.c.layout, "split"), s = $(this.c.image), o = r(this.c.badge), c = r(this.c.image_alt, r(this.c.title));
    if (e === "cover" && s)
      return t`<section class="mw-section cover-section">
        <div class="mw-container">
          <div class="cover" style="background-image:url('${s.replace(/'/g, "%27")}')" role="img" aria-label=${c}>
            ${this.sceneKind() !== "none" ? t`<canvas class="scene" aria-hidden="true"></canvas>` : a}
            ${this.renderCopy()}
          </div>
        </div>
      </section>`;
    if (!s) {
      const d = m(this.c.decor, "none"), n = this.sceneKind() !== "none";
      return t`<section class="mw-section ${n ? "has-scene" : ""}">
        ${n ? t`<canvas class="scene" aria-hidden="true"></canvas>` : a}
        <div class="mw-container solo">
          ${d !== "none" && !n ? t`<svg class="decor" viewBox="0 0 600 240" aria-hidden="true" focusable="false">${C(d)}</svg>` : a}
          ${this.renderCopy()}
        </div>
      </section>`;
    }
    const i = this.sceneKind() !== "none";
    return t`<section class="mw-section ${i ? "has-scene" : ""}">
      ${i ? t`<canvas class="scene" aria-hidden="true"></canvas>` : a}
      <div class="mw-container hero ${e}">
        ${this.renderCopy()}
        <div class="media">
          <img src=${s} alt=${c} loading="eager" fetchpriority="high" decoding="async" />
          ${o ? t`<div class="badge">${o}</div>` : a}
        </div>
      </div>
    </section>`;
  }
};
v.styles = [
  k,
  w`
      .mw-section {
        overflow-x: clip;
        position: relative;
      }
      .mw-section.has-scene {
        overflow: hidden;
        min-height: clamp(420px, 60vw, 640px);
        display: grid;
        align-items: center;
      }
      canvas.scene {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 0;
        touch-action: pan-y;
      }
      .has-scene .mw-container,
      .cover .copy {
        position: relative;
        z-index: 1;
        width: 100%;
      }
      .cover canvas.scene {
        z-index: 1;
      }
      .cover .copy {
        z-index: 2;
      }
      .mw-section.has-scene {
        padding-top: max(var(--mw-pad-y), 120px);
      }
      @media (max-width: 640px) {
        .mw-section.has-scene {
          padding-top: 150px;
          min-height: 0;
        }
      }
      .has-scene .solo .mw-title {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }
      .hero {
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        align-items: center;
        gap: clamp(24px, 5vw, 64px);
      }
      .hero.split-reverse .media {
        order: -1;
      }
      .copy {
        text-align: start;
      }
      .mw-title {
        font-size: clamp(1.9rem, 4.6vw, 3.4rem);
        margin-bottom: 14px;
      }
      .mw-sub {
        font-size: clamp(1rem, 1.6vw, 1.2rem);
        max-width: 56ch;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }
      .note {
        margin-top: 14px;
        font-size: 0.9rem;
        color: var(--mw-muted);
      }
      .media {
        position: relative;
      }
      .media img {
        width: 100%;
        aspect-ratio: 4 / 3.4;
        object-fit: cover;
        border-radius: calc(var(--mw-radius) + 6px);
        box-shadow: var(--mw-shadow);
      }
      .badge {
        position: absolute;
        inset-block-end: 18px;
        inset-inline-start: -14px;
        background: var(--mw-surface);
        color: var(--mw-ink);
        border-radius: 14px;
        padding: 10px 16px;
        font-weight: 800;
        box-shadow: var(--mw-shadow);
        border-inline-start: 4px solid var(--mw-primary);
        max-width: 80%;
      }
      :host([data-tone='primary']) .badge {
        color: #13201f;
        background: #ffffff;
      }

      /* Cover layout: image behind the text */
      .cover {
        position: relative;
        border-radius: calc(var(--mw-radius) + 8px);
        overflow: hidden;
        min-height: clamp(380px, 56vw, 600px);
        display: grid;
        align-items: end;
        background: #0f1716 center / cover no-repeat;
      }
      .cover::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(8, 14, 13, 0.82) 8%, rgba(8, 14, 13, 0.25) 60%, transparent);
      }
      .cover .copy {
        position: relative;
        z-index: 1;
        padding: clamp(24px, 5vw, 56px);
        max-width: 760px;
        color: #ffffff;
        --mw-ink: #ffffff;
        --mw-muted: rgba(255, 255, 255, 0.86);
      }
      .cover .mw-btn--ghost {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.7);
      }
      .cover-section {
        padding-block: clamp(16px, 3vw, 32px);
      }

      /* No photo: centered layout with optional decorative art */
      .solo {
        position: relative;
        text-align: center;
        max-width: 860px;
        margin-inline: auto;
        padding-block: clamp(12px, 3vw, 28px);
      }
      .solo .copy {
        text-align: center;
        position: relative;
        z-index: 1;
      }
      .solo .mw-sub {
        margin-inline: auto;
      }
      .solo .actions {
        justify-content: center;
      }
      .decor {
        position: absolute;
        inset: -10% -8% auto;
        width: 116%;
        height: auto;
        color: var(--mw-primary);
        opacity: 0.16;
        pointer-events: none;
        z-index: 0;
      }
      :host([data-tone='primary']) .decor,
      :host([data-tone='dark']) .decor {
        color: #ffffff;
        opacity: 0.14;
      }

      @media (max-width: 820px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .hero.split-reverse .media,
        .hero .media {
          order: -1;
        }
        .badge {
          inset-inline-start: 12px;
        }
        .actions .mw-btn {
          flex: 1 1 auto;
        }
      }
    `
];
let g = v;
typeof g < "u" && g.registerSallaComponent("salla-mawsim-hero");
export {
  g as default
};
