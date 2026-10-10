import { LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { openBoard } from './board';
import { getCampaign } from './products';
import { pick, prefersReducedMotion, safeUrl, txt } from './utils';

export type Tone = 'auto' | 'tint' | 'primary' | 'dark';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Relative luminance (0 = black, 1 = white) of a hex or rgb() color, or NaN if unknown. */
function luminance(color: string): number {
  let r: number, g: number, b: number;
  const c = color.trim();
  if (HEX.test(c)) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  } else {
    const m = c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return NaN;
    [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  }
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Placeholder link used when a merchant leaves a button link empty. */
export const PRODUCTS_ANCHOR = '#mawsim-products';

/**
 * Base element for every Mawsim component.
 * - receives the merchant settings in `config`
 * - applies the chosen tone (background style) and optional accent color
 * - buttons with an empty link open the products overlay board
 *   (or scroll to the Product Spotlight section, if the merchant prefers)
 */
export class MawsimBase extends LitElement {
  @property({ type: Object })
  config?: Record<string, any>;

  /** Default tone when the merchant has not chosen one. */
  protected defaultTone: Tone = 'auto';

  protected get c(): Record<string, any> {
    return this.config || {};
  }

  /** Link for a call-to-action button. Empty → open the products board / scroll to products. */
  protected ctaHref(value: unknown): string {
    return safeUrl(value) || PRODUCTS_ANCHOR;
  }

  private onAnchorClick = (e: Event) => {
    const path = e.composedPath();
    const a = path.find((el) => el instanceof HTMLAnchorElement) as HTMLAnchorElement | undefined;
    if (!a || a.getAttribute('href') !== PRODUCTS_ANCHOR) return;
    e.preventDefault();
    const campaign = getCampaign();
    if (pick(this.c.cta_action, 'board') === 'board' && campaign) {
      openBoard({
        ids: campaign.ids,
        title: campaign.title,
        subtitle: campaign.subtitle,
        scene: campaign.scene,
        accent: campaign.accent,
      });
      return;
    }
    const target = Array.from(document.querySelectorAll('*')).find((el) =>
      el.tagName.toLowerCase().startsWith('salla-mawsim-product-spotlight'),
    );
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (target) target.scrollIntoView({ behavior, block: 'start' });
    else window.scrollBy({ top: window.innerHeight * 0.85, behavior });
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.onAnchorClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.onAnchorClick);
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (!changed.has('config') && this.hasUpdated) return;

    const tone = pick<Tone>(this.c.tone, this.defaultTone);
    if (tone && tone !== 'auto') this.setAttribute('data-tone', tone);
    else this.removeAttribute('data-tone');

    const accent = txt(this.c.accent_color).trim();
    if (HEX.test(accent)) {
      this.style.setProperty('--mw-accent', accent);
    } else {
      this.style.removeProperty('--mw-accent');
    }
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('config') || !this.contrastChecked) this.fixContrast();
  }

  private contrastChecked = false;

  /**
   * Keeps text readable whatever color the store uses:
   * - very dark accent on a dark section → use white as the accent
   * - very light accent (e.g. yellow) → dark text on buttons
   */
  private fixContrast() {
    this.contrastChecked = true;
    this.style.removeProperty('--mw-primary');
    this.style.removeProperty('--mw-on-primary');

    const cs = getComputedStyle(this);
    const accent = txt(this.c.accent_color).trim();
    const base = HEX.test(accent)
      ? accent
      : cs.getPropertyValue('--color-primary').trim() || cs.getPropertyValue('--primary').trim() || '#0f766e';
    const lum = luminance(base);
    if (!Number.isFinite(lum)) return;

    const tone = this.getAttribute('data-tone');
    if (tone === 'dark' && lum < 0.08) {
      this.style.setProperty('--mw-primary', '#ffffff');
      this.style.setProperty('--mw-on-primary', '#111111');
    } else if (lum > 0.55) {
      this.style.setProperty('--mw-on-primary', '#13201f');
    }
  }
}
