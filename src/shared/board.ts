import { css, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icon } from './icons';
import {
  cleanHtml,
  fetchProduct,
  fetchProducts,
  isUnavailable,
  MwProduct,
  needsOptions,
  productImages,
} from './products';
import { FestiveScene, SceneKind } from './scene';
import { isRtl, label, lang, money, prefersReducedMotion, salla } from './utils';

export interface BoardOptions {
  /** products shown in the board grid */
  ids?: Array<number | string>;
  /** open straight on one product (quick view) */
  productId?: number | string;
  title?: string;
  subtitle?: string;
  scene?: SceneKind | string;
  accent?: string;
}

const TAG = 'mawsim-overlay-board';
const SCENES: SceneKind[] = ['none', 'ramadan', 'snow', 'ramadan-snow', 'confetti', 'stars'];

/**
 * Full-screen overlay "board": a festive animated backdrop with a floating panel
 * that lists campaign products and shows a quick view with add-to-cart.
 * One instance is shared by every Mawsim component on the page.
 */
class MawsimOverlayBoard extends LitElement {
  @state() private opened = false;
  @state() private closing = false;
  @state() private view: 'list' | 'product' = 'list';
  @state() private products: MwProduct[] = [];
  @state() private current: MwProduct | null = null;
  @state() private loading = false;
  @state() private qty = 1;
  @state() private imgIndex = 0;
  @state() private busy = false;
  @state() private added = false;
  @state() private opts: BoardOptions = {};

  private scene?: FestiveScene;
  private returnFocus: HTMLElement | null = null;
  private prevOverflow = '';
  private listIds: Array<number | string> = [];

  static styles = css`
    :host {
      --mw-primary: var(--mw-accent, var(--color-primary, var(--primary, #0f766e)));
      --mw-on-primary: var(--color-primary-reverse, #ffffff);
      --ink: #13201f;
      --muted: #5b6b69;
      --line: rgba(19, 32, 31, 0.1);
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: none;
      font-family: inherit;
      color: var(--ink);
      line-height: 1.6;
    }
    :host([open]) {
      display: block;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: radial-gradient(120% 80% at 50% 0%, var(--sky-1, #1d2b5a) 0%, var(--sky-2, #0a1024) 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .backdrop::after {
      content: '';
      position: absolute;
      inset: 0;
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: -1;
    }
    .open .backdrop {
      opacity: 0.97;
    }
    canvas.scene {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .panel {
      position: absolute;
      inset-inline: 0;
      margin-inline: auto;
      top: 50%;
      width: min(1020px, calc(100% - 32px));
      max-height: min(86vh, 860px);
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 26px;
      box-shadow:
        0 30px 80px -20px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.4) inset;
      overflow: hidden;
      transform: translateY(-46%) scale(0.94) rotateX(8deg);
      transform-origin: 50% 0;
      opacity: 0;
      transition:
        transform 0.42s cubic-bezier(0.2, 0.9, 0.25, 1.15),
        opacity 0.3s ease;
    }
    .stage {
      position: absolute;
      inset: 0;
      perspective: 1400px;
      pointer-events: none;
    }
    .stage > * {
      pointer-events: auto;
    }
    .open .panel {
      transform: translateY(-50%) scale(1) rotateX(0);
      opacity: 1;
    }
    .closing .panel {
      transform: translateY(-44%) scale(0.96);
      opacity: 0;
    }
    .closing .backdrop {
      opacity: 0;
    }

    header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, var(--mw-primary) 9%, #ffffff),
        #ffffff
      );
    }
    header .titles {
      flex: 1;
      min-width: 0;
    }
    header h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 800;
      line-height: 1.35;
    }
    header p {
      margin: 2px 0 0;
      font-size: 0.9rem;
      color: var(--muted);
    }
    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid var(--line);
      background: #ffffff;
      color: var(--ink);
      cursor: pointer;
      flex: none;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .icon-btn:hover {
      transform: rotate(90deg);
      background: #f3f6f6;
    }
    .icon-btn.back:hover {
      transform: none;
    }
    .icon-btn svg {
      width: 20px;
      height: 20px;
    }
    .flip svg {
      transform: scaleX(-1);
    }
    .content {
      overflow: auto;
      overscroll-behavior: contain;
      padding: 22px;
      flex: 1;
    }

    /* ---------- grid of products (3D tilt tiles) */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 18px;
    }
    .tile {
      --rx: 0deg;
      --ry: 0deg;
      position: relative;
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry));
      transition: transform 0.15s ease, box-shadow 0.2s ease;
      box-shadow: 0 6px 18px -12px rgba(0, 0, 0, 0.35);
      text-align: start;
      font: inherit;
      color: inherit;
      padding: 0;
      display: flex;
      flex-direction: column;
      animation: rise 0.5s both cubic-bezier(0.2, 0.9, 0.25, 1.1);
    }
    .tile:hover {
      box-shadow: 0 22px 40px -18px rgba(0, 0, 0, 0.45);
    }
    .tile .shine {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at var(--mx, 50%) var(--my, 0%),
        rgba(255, 255, 255, 0.45),
        transparent 45%
      );
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .tile:hover .shine {
      opacity: 1;
    }
    .tile .img {
      aspect-ratio: 1 / 1;
      background: #f2f5f5;
    }
    .tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .tile .info {
      padding: 12px 14px 14px;
      display: grid;
      gap: 4px;
    }
    .tile .name {
      font-weight: 700;
      font-size: 0.95rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .tile .qv {
      position: absolute;
      inset-block-start: 10px;
      inset-inline-end: 10px;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: perspective(800px) translateY(18px) rotateX(10deg);
      }
    }

    .prices {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }
    .price {
      font-weight: 800;
    }
    .old {
      color: var(--muted);
      text-decoration: line-through;
      font-size: 0.9em;
    }

    /* ---------- product quick view */
    .pv {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 28px;
      align-items: start;
    }
    .gallery {
      position: sticky;
      top: 0;
    }
    .main-img {
      --rx: 0deg;
      --ry: 0deg;
      position: relative;
      aspect-ratio: 1 / 1;
      border-radius: 20px;
      overflow: hidden;
      background: #f2f5f5;
      transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
      transition: transform 0.12s ease;
      box-shadow: 0 24px 50px -28px rgba(0, 0, 0, 0.55);
    }
    .main-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .thumbs {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      overflow-x: auto;
    }
    .thumbs button {
      width: 62px;
      height: 62px;
      flex: none;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      cursor: pointer;
      background: #f2f5f5;
    }
    .thumbs button[aria-current='true'] {
      border-color: var(--mw-primary);
    }
    .thumbs img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .pv h3 {
      margin: 0 0 6px;
      font-size: clamp(1.25rem, 2.6vw, 1.7rem);
      line-height: 1.35;
      font-weight: 800;
    }
    .promo {
      display: inline-block;
      color: var(--mw-primary);
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    .pv .prices {
      font-size: 1.35rem;
      margin: 10px 0 16px;
    }
    .desc {
      color: var(--muted);
      font-size: 0.95rem;
      max-height: 220px;
      overflow: auto;
      margin: 0 0 18px;
      padding-inline-end: 6px;
    }
    .desc img {
      max-width: 100%;
      height: auto;
    }
    .row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .qty {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 999px;
      overflow: hidden;
      direction: ltr;
    }
    .qty button {
      width: 44px;
      height: 48px;
      border: 0;
      background: #f3f6f6;
      font-size: 1.3rem;
      cursor: pointer;
      color: var(--ink);
    }
    .qty output {
      min-width: 44px;
      text-align: center;
      font-weight: 800;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 50px;
      padding: 12px 26px;
      border-radius: 999px;
      border: 2px solid var(--mw-primary);
      background: var(--mw-primary);
      color: var(--mw-on-primary);
      font: inherit;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      flex: 1;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px -12px color-mix(in srgb, var(--mw-primary) 80%, transparent);
    }
    .btn[disabled] {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .btn.ghost {
      background: transparent;
      color: var(--mw-primary);
    }
    .btn svg {
      width: 20px;
      height: 20px;
    }
    .note {
      background: color-mix(in srgb, var(--mw-primary) 8%, #ffffff);
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 14px;
      font-size: 0.92rem;
    }
    .success {
      display: grid;
      gap: 10px;
      background: #effaf3;
      border: 1px solid #bfe8cd;
      border-radius: 16px;
      padding: 14px;
      animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.25, 1.3);
    }
    .success strong {
      color: #126b3a;
    }
    @keyframes pop {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
    }
    .skel {
      background: linear-gradient(90deg, #eef2f2, #f8fafa, #eef2f2);
      background-size: 200% 100%;
      animation: sk 1.2s infinite linear;
      border-radius: 18px;
      aspect-ratio: 1 / 1.25;
    }
    @keyframes sk {
      to {
        background-position: -200% 0;
      }
    }
    .center {
      text-align: center;
      color: var(--muted);
      padding: 40px 0;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--mw-primary) 55%, #ffffff);
      outline-offset: 3px;
    }

    @media (max-width: 720px) {
      .panel {
        top: auto;
        bottom: 0;
        width: 100%;
        max-height: 90vh;
        border-radius: 24px 24px 0 0;
        transform: translateY(100%);
      }
      .open .panel {
        transform: none;
      }
      .closing .panel {
        transform: translateY(100%);
      }
      .content {
        padding: 16px;
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      }
      .pv {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .gallery {
        position: static;
      }
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      header {
        padding: 14px 16px;
      }
      header::before {
        content: '';
        position: absolute;
        top: 7px;
        inset-inline: 0;
        margin-inline: auto;
        width: 44px;
        height: 4px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.15);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
      .tile,
      .main-img {
        transform: none !important;
      }
    }
  `;

  // ------------------------------------------------------------------ public API
  async show(opts: BoardOptions) {
    this.opts = opts;
    this.listIds = (opts.ids || []).slice(0, 12);
    this.added = false;
    this.busy = false;
    this.qty = 1;
    this.imgIndex = 0;
    this.returnFocus = deepActive();

    const accent = (opts.accent || '').trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent)) this.style.setProperty('--mw-accent', accent);
    else this.style.removeProperty('--mw-accent');
    this.setSky((opts.scene as SceneKind) || 'none');

    this.dir = isRtl() ? 'rtl' : 'ltr';
    this.lang = lang();
    this.setAttribute('open', '');
    document.removeEventListener('keydown', this.onKey, true);
    document.addEventListener('keydown', this.onKey, true);
    this.prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    this.closing = false;
    this.opened = false;
    await this.updateComplete;
    requestAnimationFrame(() => (this.opened = true));
    this.startScene();

    if (opts.productId !== undefined) await this.openProduct(opts.productId);
    else await this.openList();

    (this.renderRoot.querySelector('.close') as HTMLElement | null)?.focus({ preventScroll: true });
  }

  close() {
    if (!this.hasAttribute('open') || this.closing) return;
    this.closing = true;
    document.removeEventListener('keydown', this.onKey, true);
    const done = () => {
      this.removeAttribute('open');
      this.closing = false;
      this.opened = false;
      this.scene?.destroy();
      this.scene = undefined;
      document.documentElement.style.overflow = this.prevOverflow;
      this.returnFocus?.focus?.({ preventScroll: true });
    };
    if (prefersReducedMotion()) done();
    else setTimeout(done, 280);
  }

  // ------------------------------------------------------------------ internals
  private setSky(kind: SceneKind) {
    const skies: Record<string, [string, string]> = {
      ramadan: ['#2a1f5c', '#0b0b26'],
      'ramadan-snow': ['#24306b', '#0a0f2a'],
      snow: ['#1f3a63', '#0a1428'],
      stars: ['#2b2350', '#0d0b1f'],
      confetti: ['#26302f', '#0b1110'],
      none: ['#1c2423', '#0b1110'],
    };
    const [a, b] = skies[kind] || skies.none;
    this.style.setProperty('--sky-1', a);
    this.style.setProperty('--sky-2', b);
  }

  private startScene() {
    const canvas = this.renderRoot.querySelector('canvas.scene') as HTMLCanvasElement | null;
    const kind = SCENES.includes(this.opts.scene as SceneKind) ? (this.opts.scene as SceneKind) : 'none';
    this.scene?.destroy();
    this.scene = undefined;
    if (!canvas || kind === 'none') return;
    const accent = getComputedStyle(this).getPropertyValue('--mw-primary').trim() || '#0f766e';
    this.scene = new FestiveScene(canvas, {
      kind,
      mode: 'section',
      accent,
      rtl: isRtl(),
      pointerTarget: this.renderRoot.querySelector('.root') as HTMLElement,
      density: 1.1,
    });
  }

  private async openList() {
    this.view = 'list';
    this.current = null;
    this.added = false;
    this.updateComplete.then(() => this.focusPanel());
    if (!this.listIds.length) return;
    if (this.products.length && sameIds(this.products, this.listIds)) return;
    this.loading = true;
    this.products = await fetchProducts(this.listIds);
    this.loading = false;
  }

  /** After switching views, keep keyboard focus inside the dialog. */
  private focusPanel() {
    const root = this.renderRoot as ShadowRoot;
    if (root.activeElement && root.activeElement.isConnected) return;
    (root.querySelector('.close') as HTMLElement | null)?.focus({ preventScroll: true });
  }

  private async openProduct(id: number | string) {
    this.view = 'product';
    this.added = false;
    this.qty = 1;
    this.imgIndex = 0;
    this.loading = true;
    this.current = await fetchProduct(id);
    this.loading = false;
    await this.updateComplete;
    this.renderRoot.querySelector('.content')?.scrollTo({ top: 0 });
    this.focusPanel();
  }

  private async addToCart() {
    const p = this.current;
    const s = salla();
    if (!p) return;
    if (needsOptions(p) || !s?.cart?.addItem) {
      window.location.href = p.url;
      return;
    }
    this.busy = true;
    try {
      await s.cart.addItem({ id: p.id, quantity: this.qty });
      this.added = true;
    } catch (e) {
      s?.log?.('Mawsim board: addItem failed', e);
    } finally {
      this.busy = false;
    }
  }

  private cartUrl(): string {
    const s = salla();
    try {
      return s?.url?.get?.('cart') || '/cart';
    } catch {
      return '/cart';
    }
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key !== 'Tab') return;
    const panel = this.renderRoot.querySelector('.panel');
    if (!panel) return;
    const items = Array.from(
      panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.renderRoot instanceof ShadowRoot ? this.renderRoot.activeElement : null;
    if (e.shiftKey && (active === first || !active)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  private tilt(e: PointerEvent, max = 9) {
    if (prefersReducedMotion() || e.pointerType === 'touch') return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }

  private untilt(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.onKey, true);
    this.scene?.destroy();
  }

  // ------------------------------------------------------------------ render
  private priceBlock(p: MwProduct) {
    const onSale = !!p.is_on_sale && p.sale_price && p.regular_price;
    return html`<div class="prices">
      <span class="price">${money(onSale ? p.sale_price : p.price)}</span>
      ${onSale ? html`<span class="old">${money(p.regular_price)}</span>` : nothing}
    </div>`;
  }

  private renderList() {
    if (this.loading && !this.products.length) {
      return html`<div class="grid">${this.listIds.map(() => html`<div class="skel"></div>`)}</div>`;
    }
    if (!this.products.length) return html`<div class="center">${label('pick_products')}</div>`;
    return html`<div class="grid">
      ${this.products.map(
        (p, i) => html`<button
          class="tile"
          style="animation-delay:${i * 45}ms"
          @click=${() => this.openProduct(p.id)}
          @pointermove=${(e: PointerEvent) => this.tilt(e)}
          @pointerleave=${this.untilt}
          aria-label="${p.name} — ${label('quick_view')}"
        >
          <div class="img">
            ${productImages(p)[0]
              ? html`<img src=${productImages(p)[0]} alt="" loading="lazy" decoding="async" />`
              : nothing}
          </div>
          <span class="qv">${label('quick_view')}</span>
          <div class="info">
            <span class="name">${p.name}</span>
            ${this.priceBlock(p)}
          </div>
          <span class="shine"></span>
        </button>`,
      )}
    </div>`;
  }

  private renderProduct() {
    const p = this.current;
    if (this.loading || !p) {
      return html`<div class="center">${this.loading ? label('loading') : label('error')}</div>`;
    }
    const imgs = productImages(p);
    const main = imgs[this.imgIndex] || imgs[0];
    const unavailable = isUnavailable(p);
    const options = needsOptions(p);
    const maxQ = Math.max(1, Math.min(20, p.max_quantity && p.max_quantity > 0 ? p.max_quantity : 20));
    const desc = cleanHtml(p.description);

    return html`<div class="pv">
      <div class="gallery">
        <div class="main-img" @pointermove=${(e: PointerEvent) => this.tilt(e, 6)} @pointerleave=${this.untilt}>
          ${main ? html`<img src=${main} alt=${p.image?.alt || p.name} decoding="async" />` : nothing}
        </div>
        ${imgs.length > 1
          ? html`<div class="thumbs">
              ${imgs.map(
                (src, i) => html`<button
                  aria-current=${i === this.imgIndex ? 'true' : 'false'}
                  aria-label="${i + 1} / ${imgs.length}"
                  @click=${() => (this.imgIndex = i)}
                >
                  <img src=${src} alt="" loading="lazy" />
                </button>`,
              )}
            </div>`
          : nothing}
      </div>
      <div>
        ${p.promotion_title ? html`<span class="promo">${p.promotion_title}</span>` : nothing}
        <h3>${p.name}</h3>
        ${p.subtitle ? html`<div style="color:var(--muted)">${p.subtitle}</div>` : nothing}
        ${this.priceBlock(p)}
        ${desc ? html`<div class="desc" aria-label=${label('details')}>${unsafeHTML(desc)}</div>` : nothing}

        ${this.added
          ? html`<div class="success" role="status">
              <strong>${label('added_long')}</strong>
              <div class="row">
                <a class="btn" href=${this.cartUrl()}>${label('checkout')}</a>
                ${this.listIds.length
                  ? html`<button class="btn ghost" @click=${() => this.openList()}>${label('keep_shopping')}</button>`
                  : html`<button class="btn ghost" @click=${() => this.close()}>${label('keep_shopping')}</button>`}
              </div>
            </div>`
          : options
            ? html`<div class="note">${label('options_note')}</div>
                <a class="btn" href=${p.url}>${label('choose_options')}</a>`
            : html`<div class="row">
                <div class="qty" role="group" aria-label=${label('quantity')}>
                  <button
                    aria-label=${label('decrease')}
                    ?disabled=${this.qty <= 1}
                    @click=${() => (this.qty = Math.max(1, this.qty - 1))}
                  >
                    −
                  </button>
                  <output aria-live="polite">${this.qty}</output>
                  <button
                    aria-label=${label('increase')}
                    ?disabled=${this.qty >= maxQ}
                    @click=${() => (this.qty = Math.min(maxQ, this.qty + 1))}
                  >
                    +
                  </button>
                </div>
                <button class="btn" ?disabled=${unavailable || this.busy} @click=${this.addToCart}>
                  ${unavailable ? label('out_of_stock') : html`${icon('gift')} ${label('add_to_cart')}`}
                </button>
              </div>`}
      </div>
    </div>`;
  }

  render() {
    const o = this.opts;
    const showBack = this.view === 'product' && this.listIds.length > 0;
    const title = this.view === 'product' && this.current ? this.current.name : o.title || label('campaign');
    const cls = [this.opened ? 'open' : '', this.closing ? 'closing' : ''].join(' ');
    return html`<div class="root ${cls}">
      <div class="backdrop" @click=${() => this.close()}><canvas class="scene" aria-hidden="true"></canvas></div>
      <div class="stage" @click=${(e: Event) => e.target === e.currentTarget && this.close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label=${title}>
          <header>
            ${showBack
              ? html`<button class="icon-btn back ${isRtl() ? '' : 'flip'}" aria-label=${label('back')}
                  @click=${() => this.openList()}>${icon('arrow')}</button>`
              : nothing}
            <div class="titles">
              <h2>${this.view === 'list' ? o.title || label('campaign') : label('quick_view')}</h2>
              ${this.view === 'list' && o.subtitle ? html`<p>${o.subtitle}</p>` : nothing}
            </div>
            <button class="icon-btn close" aria-label=${label('close')} @click=${() => this.close()}>
              ${icon('x')}
            </button>
          </header>
          <div class="content">${this.view === 'list' ? this.renderList() : this.renderProduct()}</div>
        </div>
      </div>
    </div>`;
  }
}

function sameIds(products: MwProduct[], ids: Array<number | string>) {
  return products.length === ids.length && products.every((p, i) => String(p.id) === String(ids[i]));
}

function deepActive(): HTMLElement | null {
  let a: Element | null = document.activeElement;
  while (a && (a as HTMLElement).shadowRoot?.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
  return a as HTMLElement | null;
}

/** Open the shared overlay board (created on first use). */
export function openBoard(opts: BoardOptions) {
  if (!customElements.get(TAG)) customElements.define(TAG, MawsimOverlayBoard);
  let el = document.querySelector(TAG) as MawsimOverlayBoard | null;
  if (!el) {
    el = document.createElement(TAG) as MawsimOverlayBoard;
    document.body.appendChild(el);
  }
  el.show(opts);
}
