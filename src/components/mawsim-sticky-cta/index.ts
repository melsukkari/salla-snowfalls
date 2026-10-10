import { css, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { MawsimBase, Tone } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { bool, label, num, pick, txt } from '../../shared/utils';

/** Mawsim Final CTA — closing banner plus an optional bar that sticks to the bottom after scrolling. */
export default class MawsimStickyCta extends MawsimBase {
  protected defaultTone: Tone = 'primary';

  @state() private barVisible = false;
  @state() private dismissed = false;
  private onScroll = () => {
    const threshold = num(this.c.show_after, 600);
    const banner = this.renderRoot.querySelector('.banner') as HTMLElement | null;
    // Hide the floating bar while the in-page banner itself is on screen
    let bannerOnScreen = false;
    if (banner) {
      const r = banner.getBoundingClientRect();
      bannerOnScreen = r.top < window.innerHeight && r.bottom > 0;
    }
    this.barVisible = window.scrollY > threshold && !bannerOnScreen;
  };

  static styles = [
    baseStyles,
    css`
      .banner {
        text-align: center;
        max-width: 820px;
        margin-inline: auto;
      }
      .banner .mw-title {
        font-size: clamp(1.6rem, 3.6vw, 2.6rem);
      }
      .banner .actions {
        margin-top: 26px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
      }
      .banner .mw-btn {
        min-width: 220px;
        min-height: 54px;
        font-size: 1.08rem;
      }
      .note {
        margin-top: 14px;
        font-size: 0.9rem;
        color: var(--mw-muted);
      }

      .bar {
        position: fixed;
        inset-inline: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        z-index: 60;
        max-width: 760px;
        margin-inline: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding-block: 10px;
        padding-inline-start: 18px;
        padding-inline-end: 10px;
        border-radius: 999px;
        background: #13201f;
        color: #ffffff;
        box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.45);
        transform: translateY(140%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        pointer-events: none;
      }
      .bar.show {
        transform: none;
        opacity: 1;
        pointer-events: auto;
      }
      .bar .text {
        flex: 1;
        min-width: 0;
        font-weight: 700;
        font-size: 0.95rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bar .mw-btn {
        min-height: 42px;
        padding: 8px 20px;
        background: var(--mw-primary);
        color: var(--mw-on-primary);
        border-color: var(--mw-primary);
        white-space: nowrap;
      }
      .close {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        cursor: pointer;
        flex: none;
      }
      .close .mw-icon {
        width: 16px;
        height: 16px;
      }
      @media (max-width: 520px) {
        .bar .text {
          font-size: 0.85rem;
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .banner .mw-btn {
          width: 100%;
        }
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const c = this.c;
    const eyebrow = txt(c.eyebrow);
    const title = txt(c.title, 'جاهز تبدأ؟');
    const subtitle = txt(c.subtitle);
    const ctaLabel = txt(c.cta_label, 'تسوّق الآن');
    const ctaUrl = this.ctaHref(c.cta_link);
    const note = txt(c.note);
    const sticky = bool(c.sticky_bar, true);
    const barText = txt(c.bar_text, title);
    const showBanner = pick<'both' | 'bar' | 'banner'>(c.mode, 'both') !== 'bar';

    return html`
      ${showBanner
        ? html`<section class="mw-section">
            <div class="mw-container banner">
              ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
              <h2 class="mw-title">${title}</h2>
              ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
              <div class="actions"><a class="mw-btn" href=${ctaUrl}>${ctaLabel} ${icon('arrow', 'mw-icon mw-flip')}</a></div>
              ${note ? html`<p class="note">${note}</p>` : nothing}
            </div>
          </section>`
        : nothing}
      ${sticky && !this.dismissed
        ? html`<div class="bar ${this.barVisible ? 'show' : ''}" role="region" aria-label=${barText}
            aria-hidden=${this.barVisible ? 'false' : 'true'}>
            <span class="text">${barText}</span>
            <a class="mw-btn" href=${ctaUrl} tabindex=${this.barVisible ? '0' : '-1'}>${ctaLabel}</a>
            ${bool(c.dismissible, true)
              ? html`<button class="close" type="button" aria-label=${label('close')}
                  tabindex=${this.barVisible ? '0' : '-1'} @click=${() => (this.dismissed = true)}>
                  ${icon('x')}
                </button>`
              : nothing}
          </div>`
        : nothing}
    `;
  }
}
