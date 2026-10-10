import { css, html, nothing } from 'lit';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { bool, list, txt } from '../../shared/utils';

interface Row {
  feature?: unknown;
  us?: unknown;
  them?: unknown;
}

/** Mawsim Comparison — "us vs. the usual option" table. */
export default class MawsimComparison extends MawsimBase {
  static styles = [
    baseStyles,
    css`
      .wrap {
        max-width: 860px;
        margin-inline: auto;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius);
        overflow: hidden;
        box-shadow: var(--mw-shadow);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 14px clamp(12px, 2.4vw, 22px);
        border-bottom: 1px solid var(--mw-line);
        text-align: start;
      }
      tr:last-child td {
        border-bottom: 0;
      }
      thead th {
        font-size: 0.95rem;
        font-weight: 800;
        background: color-mix(in srgb, var(--mw-primary) 6%, transparent);
      }
      th.col,
      td.col {
        text-align: center;
        width: 24%;
      }
      th.us {
        background: var(--mw-primary);
        color: var(--mw-on-primary);
      }
      td.us {
        background: color-mix(in srgb, var(--mw-primary) 7%, transparent);
      }
      :host([data-tone='primary']) th.us {
        background: var(--mw-on-primary);
        color: var(--mw-primary);
      }
      td.feature {
        font-weight: 600;
      }
      .yes,
      .no {
        display: inline-grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      .yes {
        background: var(--mw-primary);
        color: var(--mw-on-primary);
      }
      :host([data-tone='primary']) .yes {
        background: var(--mw-on-primary);
        color: var(--mw-primary);
      }
      .no {
        background: rgba(127, 127, 127, 0.15);
        color: var(--mw-muted);
      }
      .yes .mw-icon,
      .no .mw-icon {
        width: 16px;
        height: 16px;
      }
      .cta {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
      }
      .sr {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
      @media (max-width: 520px) {
        th,
        td {
          padding: 12px 10px;
          font-size: 0.9rem;
        }
      }
    `,
  ];

  private mark(v: boolean, yes: string, no: string) {
    return v
      ? html`<span class="yes">${icon('check')}</span><span class="sr">${yes}</span>`
      : html`<span class="no">${icon('x')}</span><span class="sr">${no}</span>`;
  }

  render() {
    const c = this.c;
    const eyebrow = txt(c.eyebrow);
    const title = txt(c.title);
    const subtitle = txt(c.subtitle);
    const us = txt(c.us_label, 'متجرنا');
    const them = txt(c.them_label, 'الخيارات الأخرى');
    const rows = list<Row>(c.rows).filter((r) => txt(r?.feature));
    const ctaLabel = txt(c.cta_label);
    const ctaUrl = this.ctaHref(c.cta_link);

    return html`<section class="mw-section">
      <div class="mw-container">
        ${title || subtitle || eyebrow
          ? html`<header class="mw-head">
              ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
              ${title ? html`<h2 class="mw-title">${title}</h2>` : nothing}
              ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
            </header>`
          : nothing}
        <div class="wrap">
          <table>
            <thead>
              <tr>
                <th scope="col"><span class="sr">${title}</span></th>
                <th scope="col" class="col us">${us}</th>
                <th scope="col" class="col">${them}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(
                (r) => html`<tr>
                  <td class="feature">${txt(r.feature)}</td>
                  <td class="col us">${this.mark(bool(r.us, true), us, us)}</td>
                  <td class="col">${this.mark(bool(r.them, false), them, them)}</td>
                </tr>`,
              )}
            </tbody>
          </table>
        </div>
        ${ctaLabel ? html`<div class="cta"><a class="mw-btn" href=${ctaUrl}>${ctaLabel}</a></div>` : nothing}
      </div>
    </section>`;
  }
}
