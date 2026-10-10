import { css, html, nothing } from 'lit';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { bool, lang, list, num, safeImg, txt } from '../../shared/utils';

interface Review {
  name?: unknown;
  city?: unknown;
  text?: unknown;
  rating?: unknown;
  avatar?: unknown;
}

/** Mawsim Social Proof — customer reviews with ratings and a summary score. */
export default class MawsimTestimonials extends MawsimBase {
  static styles = [
    baseStyles,
    css`
      .summary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-top: 14px;
        padding: 8px 16px;
        border-radius: 999px;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        font-weight: 700;
      }
      .stars {
        display: inline-flex;
        gap: 2px;
        color: #f5a524;
      }
      .stars .mw-icon {
        width: 18px;
        height: 18px;
      }
      .stars .on svg {
        fill: currentColor;
      }
      .stars .off {
        opacity: 0.3;
      }
      .track {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: calc((100% - 2 * var(--mw-gap)) / 3);
        gap: var(--mw-gap);
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 12px;
        scrollbar-width: thin;
      }
      .card {
        scroll-snap-align: start;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        padding: clamp(18px, 2.4vw, 26px);
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: var(--mw-shadow);
      }
      blockquote {
        margin: 0;
        font-size: 1rem;
        line-height: 1.75;
        flex: 1;
      }
      .who {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        flex: none;
      }
      .initial {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: color-mix(in srgb, var(--mw-primary) 14%, transparent);
        color: var(--mw-primary);
        font-weight: 800;
        flex: none;
      }
      :host([data-tone='primary']) .initial,
      :host([data-tone='dark']) .initial {
        background: rgba(255, 255, 255, 0.14);
        color: var(--mw-ink);
      }
      .name {
        font-weight: 800;
        display: block;
      }
      .city {
        font-size: 0.85rem;
        color: var(--mw-muted);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .city .mw-icon {
        width: 14px;
        height: 14px;
        color: var(--mw-primary);
      }
      @media (max-width: 900px) {
        .track {
          grid-auto-columns: calc((100% - var(--mw-gap)) / 2);
        }
      }
      @media (max-width: 560px) {
        .track {
          grid-auto-columns: 86%;
        }
      }
    `,
  ];

  private stars(value: number) {
    const v = Math.round(Math.min(5, Math.max(0, value)));
    return html`<span class="stars" aria-label="${v} / 5">
      ${[1, 2, 3, 4, 5].map((i) => html`<span class=${i <= v ? 'on' : 'off'}>${icon('star')}</span>`)}
    </span>`;
  }

  render() {
    const c = this.c;
    const eyebrow = txt(c.eyebrow);
    const title = txt(c.title);
    const subtitle = txt(c.subtitle);
    const reviews = list<Review>(c.items).filter((r) => txt(r?.text));
    const showSummary = bool(c.show_summary, true);
    const avg = reviews.length ? reviews.reduce((a, r) => a + num(r.rating, 5), 0) / reviews.length : 0;
    const summaryText = txt(c.summary_text);
    const avgStr = avg.toLocaleString(lang() === 'ar' ? 'ar-SA' : 'en-US', { maximumFractionDigits: 1 });

    return html`<section class="mw-section">
      <div class="mw-container">
        <header class="mw-head">
          ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
          ${title ? html`<h2 class="mw-title">${title}</h2>` : nothing}
          ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
          ${showSummary && reviews.length
            ? html`<div class="summary">${this.stars(avg)} <span>${avgStr}</span>
                ${summaryText ? html`<span>· ${summaryText}</span>` : nothing}</div>`
            : nothing}
        </header>
        <div class="track" role="list">
          ${reviews.map((r) => {
            const name = txt(r.name, lang() === 'ar' ? 'عميل' : 'Customer');
            const avatar = safeImg(r.avatar);
            const city = txt(r.city);
            return html`<figure class="card" role="listitem">
              ${this.stars(num(r.rating, 5))}
              <blockquote>${txt(r.text)}</blockquote>
              <figcaption class="who">
                ${avatar
                  ? html`<img class="avatar" src=${avatar} alt="" loading="lazy" decoding="async" />`
                  : html`<span class="initial" aria-hidden="true">${name.trim().charAt(0)}</span>`}
                <span>
                  <span class="name">${name}</span>
                  ${city ? html`<span class="city">${icon('check')} ${city}</span>` : nothing}
                </span>
              </figcaption>
            </figure>`;
          })}
        </div>
      </div>
    </section>`;
  }
}
