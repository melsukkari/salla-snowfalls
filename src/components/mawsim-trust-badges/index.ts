import { css, html, nothing } from 'lit';
import { MawsimBase, Tone } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { list, pick, txt } from '../../shared/utils';

interface Badge {
  icon?: unknown;
  title?: unknown;
  text?: unknown;
}

/** Mawsim Trust Badges — shipping, payment, returns and support reassurance strip. */
export default class MawsimTrustBadges extends MawsimBase {
  protected defaultTone: Tone = 'tint';

  static styles = [
    baseStyles,
    css`
      .mw-section {
        padding-block: clamp(28px, 5vw, 52px);
      }
      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 14px var(--mw-gap);
      }
      .badge {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .ico {
        display: grid;
        place-items: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--mw-surface);
        color: var(--mw-primary);
        box-shadow: var(--mw-shadow);
        flex: none;
      }
      :host([data-tone='primary']) .ico {
        background: rgba(255, 255, 255, 0.14);
        color: var(--mw-ink);
        box-shadow: none;
      }
      strong {
        display: block;
        font-weight: 800;
        line-height: 1.35;
      }
      span.t {
        display: block;
        font-size: 0.88rem;
        color: var(--mw-muted);
      }
      .title {
        text-align: center;
        font-weight: 800;
        font-size: 1.15rem;
        margin: 0 0 22px;
      }
      @media (max-width: 520px) {
        .row {
          grid-template-columns: 1fr 1fr;
        }
        .badge {
          flex-direction: column;
          text-align: center;
          gap: 8px;
        }
      }
    `,
  ];

  render() {
    const c = this.c;
    const title = txt(c.title);
    const items = list<Badge>(c.items).filter((b) => txt(b?.title));

    return html`<section class="mw-section">
      <div class="mw-container">
        ${title ? html`<p class="title">${title}</p>` : nothing}
        <div class="row">
          ${items.map(
            (b) => html`<div class="badge">
              <span class="ico">${icon(pick(b.icon, 'shield'))}</span>
              <span>
                <strong>${txt(b.title)}</strong>
                ${txt(b.text) ? html`<span class="t">${txt(b.text)}</span>` : nothing}
              </span>
            </div>`,
          )}
        </div>
      </div>
    </section>`;
  }
}
