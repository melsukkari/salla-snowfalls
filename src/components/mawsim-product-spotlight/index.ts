import { css, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { openBoard } from '../../shared/board';
import { fetchProducts, MwProduct, needsOptions, registerCampaign } from '../../shared/products';
import { SceneKind } from '../../shared/scene';
import { bool, ids, label, money, pick, safeImg, safeUrl, salla, sallaReady, txt } from '../../shared/utils';

type SpotProduct = MwProduct;

const MAX_PRODUCTS = 8;

/** Mawsim Product Spotlight — the campaign's chosen products, quick view board and direct add to cart. */
export default class MawsimProductSpotlight extends MawsimBase {
  @state() private products: SpotProduct[] = [];
  @state() private loading = false;
  @state() private busyId: number | string | null = null;
  private loadedKey = '';

  static styles = [
    baseStyles,
    css`
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
    `,
  ];

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('config')) this.load();
  }

  private campaignOpts() {
    const c = this.c;
    const accent = txt(c.accent_color).trim();
    return {
      ids: ids(c.products).slice(0, MAX_PRODUCTS),
      title: txt(c.board_title) || txt(c.title),
      subtitle: txt(c.board_subtitle) || txt(c.subtitle),
      scene: pick<SceneKind>(c.board_scene, 'confetti'),
      accent: /^#[0-9a-f]{3,8}$/i.test(accent) ? accent : undefined,
    };
  }

  private get useBoard(): boolean {
    return pick(this.c.open_mode, 'board') === 'board';
  }

  private async load() {
    const list = ids(this.c.products).slice(0, MAX_PRODUCTS);
    if (list.length) registerCampaign(this.campaignOpts());
    const key = list.join(',');
    if (key === this.loadedKey) return;
    this.loadedKey = key;
    if (!list.length) {
      this.products = [];
      return;
    }
    this.loading = true;
    await sallaReady();
    const found = await fetchProducts(list);
    if (this.loadedKey !== key) return; // settings changed while loading
    this.products = found;
    this.loading = false;
  }

  private quickView(e: Event, p: SpotProduct) {
    if (!this.useBoard) return;
    e.preventDefault();
    openBoard({ ...this.campaignOpts(), productId: p.id });
  }

  private needsProductPage(p: SpotProduct): boolean {
    return needsOptions(p);
  }

  private async addToCart(p: SpotProduct) {
    const s = salla();
    if (this.needsProductPage(p) && this.useBoard) {
      openBoard({ ...this.campaignOpts(), productId: p.id });
      return;
    }
    if (this.needsProductPage(p) || !s?.cart?.addItem) {
      window.location.href = p.url;
      return;
    }
    this.busyId = p.id;
    try {
      await s.cart.addItem({ id: p.id, quantity: 1 });
    } catch (e) {
      s?.log?.('Mawsim spotlight: addItem failed', e);
      // Salla shows its own error toast; fall back to the product page if it was an options error
      if (this.needsProductPage(p)) window.location.href = p.url;
    } finally {
      this.busyId = null;
    }
  }

  private renderCard(p: SpotProduct, ribbon: string, showCart: boolean) {
    const img = safeImg(p.image?.url);
    const onSale = !!p.is_on_sale && p.sale_price && p.regular_price;
    const unavailable = p.is_available === false || p.is_out_of_stock === true;
    const url = safeUrl(p.url) || '#';
    const promo = txt(p.promotion_title);

    return html`<article class="card">
      <a class="thumb" href=${url} tabindex="-1" aria-hidden="true" @click=${(e: Event) => this.quickView(e, p)}>
        ${img ? html`<img src=${img} alt=${p.image?.alt || p.name} loading="lazy" decoding="async" />` : nothing}
      </a>
      ${ribbon ? html`<span class="ribbon">${ribbon}</span>` : nothing}
      <div class="body">
        <a class="name" href=${url} @click=${(e: Event) => this.quickView(e, p)}>${p.name}</a>
        ${promo ? html`<span class="promo">${promo}</span>` : nothing}
        <div class="prices">
          <span class="price">${money(onSale ? p.sale_price : p.price)}</span>
          ${onSale ? html`<span class="old">${money(p.regular_price)}</span>` : nothing}
        </div>
        ${showCart
          ? html`<button
              class="mw-btn"
              ?disabled=${unavailable || this.busyId === p.id}
              @click=${() => this.addToCart(p)}
            >
              ${unavailable
                ? label('out_of_stock')
                : this.needsProductPage(p)
                  ? label('view')
                  : html`${icon('gift', 'mw-icon')} ${label('add_to_cart')}`}
            </button>`
          : nothing}
      </div>
    </article>`;
  }

  render() {
    const c = this.c;
    const title = txt(c.title);
    const subtitle = txt(c.subtitle);
    const eyebrow = txt(c.eyebrow);
    const ribbon = txt(c.ribbon);
    const showCart = bool(c.show_add_to_cart, true);
    const cols = Math.min(4, Math.max(2, parseInt(pick(c.columns, '3'), 10) || 3));
    const count = ids(c.products).slice(0, MAX_PRODUCTS).length;
    const moreLabel = txt(c.more_label);
    const moreUrl = safeUrl(c.more_link);

    return html`<section class="mw-section">
      <div class="mw-container">
        ${title || subtitle || eyebrow
          ? html`<header class="mw-head">
              ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
              ${title ? html`<h2 class="mw-title">${title}</h2>` : nothing}
              ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
            </header>`
          : nothing}
        ${!count
          ? html`<div class="mw-empty">${label('pick_products')}</div>`
          : html`<div class="grid" style="--cols:${cols}">
              ${this.loading && !this.products.length
                ? Array.from({ length: count }).map(
                    () => html`<div class="card">
                      <div class="sk img"></div>
                      <div class="body"><div class="sk line"></div><div class="sk line" style="width:60%"></div></div>
                    </div>`,
                  )
                : this.products.map((p) => this.renderCard(p, ribbon, showCart))}
            </div>`}
        ${moreLabel && moreUrl
          ? html`<div class="more"><a class="mw-btn mw-btn--ghost" href=${moreUrl}>${moreLabel}</a></div>`
          : nothing}
      </div>
    </section>`;
  }
}
