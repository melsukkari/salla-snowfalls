import { css, html, nothing } from 'lit';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { bool, list, safeUrl, txt } from '../../shared/utils';

interface Faq {
  question?: unknown;
  answer?: unknown;
}

/** Mawsim FAQ — answers the objections that stop customers from buying. */
export default class MawsimFaq extends MawsimBase {
  static styles = [
    baseStyles,
    css`
      .list {
        max-width: 820px;
        margin-inline: auto;
        display: grid;
        gap: 12px;
      }
      details {
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius-sm);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      details[open] {
        border-color: color-mix(in srgb, var(--mw-primary) 50%, transparent);
        box-shadow: var(--mw-shadow);
      }
      summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 20px;
        font-weight: 700;
        font-size: 1.02rem;
        border-radius: var(--mw-radius-sm);
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .chev {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--mw-primary) 12%, transparent);
        color: var(--mw-primary);
        flex: none;
        transition: transform 0.2s ease;
      }
      :host([data-tone='primary']) .chev,
      :host([data-tone='dark']) .chev {
        background: rgba(255, 255, 255, 0.14);
        color: var(--mw-ink);
      }
      .chev .mw-icon {
        width: 18px;
        height: 18px;
      }
      details[open] .chev {
        transform: rotate(180deg);
      }
      .answer {
        padding: 0 20px 20px;
        color: var(--mw-muted);
        white-space: pre-line;
        line-height: 1.8;
      }
      .contact {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
        color: var(--mw-muted);
      }
      .contact .mw-btn {
        margin-top: 12px;
      }
    `,
  ];

  /** Keep only one item open when "one at a time" is on. */
  private onToggle(e: Event) {
    if (!bool(this.c.single_open, true)) return;
    const el = e.target as HTMLDetailsElement;
    if (!el.open) return;
    this.renderRoot.querySelectorAll('details').forEach((d) => {
      if (d !== el) d.open = false;
    });
  }

  render() {
    const c = this.c;
    const eyebrow = txt(c.eyebrow);
    const title = txt(c.title);
    const subtitle = txt(c.subtitle);
    const items = list<Faq>(c.items).filter((f) => txt(f?.question));
    const openFirst = bool(c.open_first, true);
    const contactText = txt(c.contact_text);
    const contactLabel = txt(c.contact_label);
    const contactUrl = safeUrl(c.contact_link);

    return html`<section class="mw-section">
      <div class="mw-container">
        ${title || subtitle || eyebrow
          ? html`<header class="mw-head">
              ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
              ${title ? html`<h2 class="mw-title">${title}</h2>` : nothing}
              ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
            </header>`
          : nothing}
        <div class="list">
          ${items.map(
            (f, i) => html`<details ?open=${openFirst && i === 0} @toggle=${this.onToggle}>
              <summary>
                <span>${txt(f.question)}</span>
                <span class="chev" aria-hidden="true">${icon('chevron')}</span>
              </summary>
              <div class="answer">${txt(f.answer)}</div>
            </details>`,
          )}
        </div>
        ${contactText || (contactLabel && contactUrl)
          ? html`<div class="contact">
              ${contactText ? html`<div>${contactText}</div>` : nothing}
              ${contactLabel && contactUrl
                ? html`<a class="mw-btn mw-btn--ghost" href=${contactUrl}>${icon('chat')} ${contactLabel}</a>`
                : nothing}
            </div>`
          : nothing}
      </div>
    </section>`;
  }
}
