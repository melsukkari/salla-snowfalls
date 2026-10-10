import { css as x, nothing as d, html as r } from "lit";
import { state as m } from "lit/decorators.js";
import { M as k, p, b as f, d as u, n as g, F as v, e as w, c as y } from "./base-DhvH5e79.js";
var _ = Object.defineProperty, b = (h, e, s, a) => {
  for (var t = void 0, i = h.length - 1, o; i >= 0; i--)
    (o = h[i]) && (t = o(e, s, t) || t);
  return t && _(e, s, t), t;
};
const c = class c extends k {
  constructor() {
    super(...arguments), this.hidden_ = !1, this.fading = !1, this.sceneKey = "";
  }
  kind() {
    const e = p(this.c.effect, "snow");
    return e === "ramadan" ? "stars" : e === "ramadan-snow" ? "snow" : e;
  }
  updated(e) {
    super.updated(e), f(this.c.desktop_only, !1) ? this.setAttribute("data-desktop-only", "") : this.removeAttribute("data-desktop-only"), this.sync();
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this.scene) == null || e.destroy(), this.scene = void 0, this.sceneKey = "", clearTimeout(this.timer);
  }
  connectedCallback() {
    super.connectedCallback(), this.hasUpdated && this.sync();
  }
  sync() {
    var o;
    const e = this.renderRoot.querySelector("canvas");
    if (!e || this.hidden_ || u()) {
      (o = this.scene) == null || o.destroy(), this.scene = void 0, this.sceneKey = "";
      return;
    }
    const s = this.kind(), a = getComputedStyle(this).getPropertyValue("--mw-primary").trim() || "#0f766e", t = g(p(this.c.density, "1"), 1) * 0.6, i = [s, a, t].join("|");
    if (this.scene)
      i !== this.sceneKey && this.scene.update({ kind: s, accent: a, density: t });
    else {
      this.scene = new v(e, {
        kind: s,
        mode: "page",
        accent: a,
        density: t,
        rtl: w(),
        pointerTarget: window,
        onLight: !0
      });
      const l = g(this.c.duration, 0);
      clearTimeout(this.timer), l > 0 && (this.timer = window.setTimeout(() => this.stop(), l * 1e3));
    }
    this.sceneKey = i;
  }
  /** Fade out, then free the canvas. */
  stop() {
    this.fading = !0, window.setTimeout(() => {
      this.hidden_ = !0, this.fading = !1;
    }, 1200);
  }
  toggle() {
    this.hidden_ ? this.hidden_ = !1 : this.stop();
  }
  render() {
    if (u()) return d;
    const e = f(this.c.show_toggle, !0);
    return r`
      ${this.hidden_ ? d : r`<canvas class=${this.fading ? "fade" : ""} aria-hidden="true"></canvas>`}
      ${e ? r`<button
            class="toggle"
            type="button"
            aria-pressed=${this.hidden_ ? "false" : "true"}
            aria-label=${this.hidden_ ? "✨" : y("close")}
            title=${this.hidden_ ? "✨" : y("close")}
            @click=${this.toggle}
          >
            ${this.hidden_ ? "✨" : "❄"}
          </button>` : d}
    `;
  }
};
c.styles = x`
    :host {
      display: block;
      height: 0;
    }
    canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 45;
      opacity: 1;
      transition: opacity 1.2s ease;
    }
    canvas.fade {
      opacity: 0;
    }
    .toggle {
      position: fixed;
      inset-block-end: calc(84px + env(safe-area-inset-bottom, 0px));
      inset-inline-end: 14px;
      z-index: 46;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 0;
      background: rgba(19, 32, 31, 0.72);
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(6px);
    }
    .toggle:focus-visible {
      outline: 3px solid #ffffff;
      outline-offset: 2px;
    }
    @media (max-width: 640px) {
      :host([data-desktop-only]) canvas,
      :host([data-desktop-only]) .toggle {
        display: none;
      }
    }
  `;
let n = c;
b([
  m()
], n.prototype, "hidden_");
b([
  m()
], n.prototype, "fading");
typeof n < "u" && n.registerSallaComponent("salla-mawsim-festive-layer");
export {
  n as default
};
