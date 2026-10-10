import { css, html, nothing } from 'lit';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { list, pick, txt } from '../../shared/utils';

interface Benefit {
  icon?: unknown;
  title?: unknown;
  text?: unknown;
}

/** Mawsim Benefits — key reasons to buy, as an icon grid. */
export default class MawsimBenefits extends MawsimBase {
  static styles = [
    baseStyles,
    css`
      .grid {
        display: grid;
        gap: var(--mw-gap);
        grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
      }
      .item {
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        padding: clamp(20px, 2.6vw, 28px);
        text-align: start;
        transition: border-color 0.2s ease, transform 0.2s ease;
      }
      .item:hover {
        border-color: color-mix(in srgb, var(--mw-primary) 45%, transparent);
        transform: translateY(-2px);
      }
      .ico {
        display: inline-grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--mw-primary) 12%, transparent);
        color: var(--mw-primary);
        margin-bottom: 14px;
      }
      :host([data-tone='primary']) .ico,
      :host([data-tone='dark']) .ico {
        background: rgba(255, 255, 255, 0.12);
        color: var(--mw-ink);
      }
      .ico .mw-icon {
        width: 26px;
        height: 26px;
      }
      h3 {
        margin: 0 0 6px;
        font-size: 1.08rem;
        font-weight: 800;
      }
      p {
        margin: 0;
        color: var(--mw-muted);
        font-size: 0.96rem;
      }
      .centered .item {
        text-align: center;
      }
      @media (max-width: 900px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 520px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .item {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0 14px;
          align-items: start;
          text-align: start !important;
        }
        .ico {
          grid-row: span 2;
          margin: 0;
        }
      }
    `,
  ];

  render() {
    const c = this.c;
    const eyebrow = txt(c.eyebrow);
    const title = txt(c.title);
    const subtitle = txt(c.subtitle);
    const items = list<Benefit>(c.items).filter((b) => txt(b?.title) || txt(b?.text));
    const cols = Math.min(4, Math.max(2, parseInt(pick(c.columns, '3'), 10) || 3));
    const align = pick<'start' | 'center'>(c.align, 'start');

    return html`<section class="mw-section">
      <div class="mw-container">
        ${title || subtitle || eyebrow
          ? html`<header class="mw-head">
              ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
              ${title ? html`<h2 class="mw-title">${title}</h2>` : nothing}
              ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
            </header>`
          : nothing}
        <div class="grid ${align === 'center' ? 'centered' : ''}" style="--cols:${cols}">
          ${items.map(
            (b) => html`<div class="item">
              <span class="ico">${icon(pick(b.icon, 'check'))}</span>
              ${txt(b.title) ? html`<h3>${txt(b.title)}</h3>` : nothing}
              ${txt(b.text) ? html`<p>${txt(b.text)}</p>` : nothing}
            </div>`,
          )}
        </div>
      </div>
    </section>`;
  }
}
