import { css as P, nothing as n, html as e } from "lit";
import { state as v } from "lit/decorators.js";
import { M as C, t as r, p as b, g as f, r as z, h as O, j as q, o as $, k as B, f as j, s as _, m as I, c as g, i as K, b as M, q as T } from "./base-DhvH5e79.js";
import { b as U } from "./styles-BrSr9s7o.js";
var V = Object.defineProperty, x = (k, t, a, s) => {
  for (var i = void 0, o = k.length - 1, d; o >= 0; o--)
    (d = k[o]) && (i = d(t, a, i) || i);
  return i && V(t, a, i), i;
};
const w = 8, y = class y extends C {
  constructor() {
    super(...arguments), this.products = [], this.loading = !1, this.busyId = null, this.loadedKey = "";
  }
  updated(t) {
    t.has("config") && this.load();
  }
  campaignOpts() {
    const t = this.c, a = r(t.accent_color).trim();
    return {
      ids: f(t.products).slice(0, w),
      title: r(t.board_title) || r(t.title),
      subtitle: r(t.board_subtitle) || r(t.subtitle),
      scene: b(t.board_scene, "confetti"),
      accent: /^#[0-9a-f]{3,8}$/i.test(a) ? a : void 0
    };
  }
  get useBoard() {
    return b(this.c.open_mode, "board") === "board";
  }
  async load() {
    const t = f(this.c.products).slice(0, w);
    t.length && z(this.campaignOpts());
    const a = t.join(",");
    if (a === this.loadedKey) return;
    if (this.loadedKey = a, !t.length) {
      this.products = [];
      return;
    }
    this.loading = !0, await O();
    const s = await q(t);
    this.loadedKey === a && (this.products = s, this.loading = !1);
  }
  quickView(t, a) {
    this.useBoard && (t.preventDefault(), $({ ...this.campaignOpts(), productId: a.id }));
  }
  needsProductPage(t) {
    return B(t);
  }
  async addToCart(t) {
    var s, i;
    const a = T();
    if (this.needsProductPage(t) && this.useBoard) {
      $({ ...this.campaignOpts(), productId: t.id });
      return;
    }
    if (this.needsProductPage(t) || !((s = a == null ? void 0 : a.cart) != null && s.addItem)) {
      window.location.href = t.url;
      return;
    }
    this.busyId = t.id;
    try {
      await a.cart.addItem({ id: t.id, quantity: 1 });
    } catch (o) {
      (i = a == null ? void 0 : a.log) == null || i.call(a, "Mawsim spotlight: addItem failed", o), this.needsProductPage(t) && (window.location.href = t.url);
    } finally {
      this.busyId = null;
    }
  }
  renderCard(t, a, s) {
    var m, p;
    const i = j((m = t.image) == null ? void 0 : m.url), o = !!t.is_on_sale && t.sale_price && t.regular_price, d = t.is_available === !1 || t.is_out_of_stock === !0, h = _(t.url) || "#", l = r(t.promotion_title);
    return e`<article class="card">
      <a class="thumb" href=${h} tabindex="-1" aria-hidden="true" @click=${(u) => this.quickView(u, t)}>
        ${i ? e`<img src=${i} alt=${((p = t.image) == null ? void 0 : p.alt) || t.name} loading="lazy" decoding="async" />` : n}
      </a>
      ${a ? e`<span class="ribbon">${a}</span>` : n}
      <div class="body">
        <a class="name" href=${h} @click=${(u) => this.quickView(u, t)}>${t.name}</a>
        ${l ? e`<span class="promo">${l}</span>` : n}
        <div class="prices">
          <span class="price">${I(o ? t.sale_price : t.price)}</span>
          ${o ? e`<span class="old">${I(t.regular_price)}</span>` : n}
        </div>
        ${s ? e`<button
              class="mw-btn"
              ?disabled=${d || this.busyId === t.id}
              @click=${() => this.addToCart(t)}
            >
              ${d ? g("out_of_stock") : this.needsProductPage(t) ? g("view") : e`${K("gift", "mw-icon")} ${g("add_to_cart")}`}
            </button>` : n}
      </div>
    </article>`;
  }
  render() {
    const t = this.c, a = r(t.title), s = r(t.subtitle), i = r(t.eyebrow), o = r(t.ribbon), d = M(t.show_add_to_cart, !0), h = Math.min(4, Math.max(2, parseInt(b(t.columns, "3"), 10) || 3)), l = f(t.products).slice(0, w).length, m = r(t.more_label), p = _(t.more_link);
    return e`<section class="mw-section">
      <div class="mw-container">
        ${a || s || i ? e`<header class="mw-head">
              ${i ? e`<span class="mw-eyebrow">${i}</span>` : n}
              ${a ? e`<h2 class="mw-title">${a}</h2>` : n}
              ${s ? e`<p class="mw-sub">${s}</p>` : n}
            </header>` : n}
        ${l ? e`<div class="grid" style="--cols:${h}">
              ${this.loading && !this.products.length ? Array.from({ length: l }).map(
      () => e`<div class="card">
                      <div class="sk img"></div>
                      <div class="body"><div class="sk line"></div><div class="sk line" style="width:60%"></div></div>
                    </div>`
    ) : this.products.map((u) => this.renderCard(u, o, d))}
            </div>` : e`<div class="mw-empty">${g("pick_products")}</div>`}
        ${m && p ? e`<div class="more"><a class="mw-btn mw-btn--ghost" href=${p}>${m}</a></div>` : n}
      </div>
    </section>`;
  }
};
y.styles = [
  U,
  P`
      .grid {
        display: grid;
        gap: var(--mw-gap);
        grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
      }
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        overflow: hidden;
        box-shadow: var(--mw-shadow);
        transition: transform 0.2s ease;
      }
      .card:hover {
        transform: translateY(-3px);
      }
      .thumb {
        display: block;
        aspect-ratio: 1 / 1;
        background: color-mix(in srgb, var(--mw-primary) 6%, #f4f6f6);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .ribbon {
        position: absolute;
        inset-block-start: 12px;
        inset-inline-start: 12px;
        background: var(--mw-primary);
        color: var(--mw-on-primary);
        font-size: 0.8rem;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 999px;
      }
      .body {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 16px 16px 18px;
        flex: 1;
      }
      .name {
        font-weight: 700;
        font-size: 1.02rem;
        line-height: 1.45;
        color: var(--mw-ink);
        text-decoration: none;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .promo {
        font-size: 0.85rem;
        color: var(--mw-primary);
        font-weight: 700;
      }
      :host([data-tone='primary']) .promo,
      :host([data-tone='dark']) .promo {
        color: var(--mw-ink);
      }
      .prices {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: auto;
        padding-top: 6px;
      }
      .price {
        font-weight: 800;
        font-size: 1.12rem;
      }
      .old {
        color: var(--mw-muted);
        text-decoration: line-through;
        font-size: 0.92rem;
      }
      .card .mw-btn {
        width: 100%;
        margin-top: 12px;
        min-height: 44px;
        padding: 10px 16px;
      }
      .sk {
        background: linear-gradient(90deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.11), rgba(0, 0, 0, 0.06));
        background-size: 200% 100%;
        animation: sk 1.3s infinite linear;
        border-radius: 8px;
      }
      .sk.img {
        aspect-ratio: 1 / 1;
        border-radius: 0;
      }
      .sk.line {
        height: 14px;
        margin: 6px 0;
      }
      @keyframes sk {
        to {
          background-position: -200% 0;
        }
      }
      .more {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
      }
      @media (max-width: 900px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 480px) {
        .grid {
          gap: 12px;
        }
        .body {
          padding: 12px;
        }
        .name {
          font-size: 0.92rem;
        }
      }
    `
];
let c = y;
x([
  v()
], c.prototype, "products");
x([
  v()
], c.prototype, "loading");
x([
  v()
], c.prototype, "busyId");
typeof c < "u" && c.registerSallaComponent("salla-mawsim-product-spotlight");
export {
  c as default
};
