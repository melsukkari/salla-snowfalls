import { css, html, nothing } from 'lit';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { list, safeImg, txt } from '../../shared/utils';

/** Mawsim Problem → Solution — name the customer's pain, then show the fix. */
export default class MawsimProblemSolution extends MawsimBase {
  static styles = [
    baseStyles,
    css`
      .cols {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: var(--mw-gap);
        align-items: stretch;
      }
      .panel {
        border-radius: var(--mw-radius);
        padding: clamp(20px, 3vw, 32px);
        border: 1px solid var(--mw-line);
        background: var(--mw-card);
      }
      .panel.solution {
        border: 2px solid var(--mw-primary);
        box-shadow: var(--mw-shadow);
      }
      .panel h3 {
        margin: 0 0 16px;
        font-size: 1.2rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .tag {
        display: inline-grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        flex: none;
      }
      .problem .tag {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
      }
      .solution .tag {
        background: color-mix(in srgb, var(--mw-primary) 14%, transparent);
        color: var(--mw-primary);
      }
      :host([data-tone='primary']) .solution .tag,
      :host([data-tone='dark']) .solution .tag {
        color: var(--mw-ink);
      }
      .tag .mw-icon {
        width: 18px;
        height: 18px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
      }
      li {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
      li .mw-icon {
        width: 20px;
        height: 20px;
        margin-top: 3px;
      }
      .problem li {
        color: var(--mw-muted);
      }
      .problem li .mw-icon {
        color: #dc2626;
      }
      .solution li .mw-icon {
        color: var(--mw-primary);
      }
      :host([data-tone='primary']) li .mw-icon,
      :host([data-tone='dark']) li .mw-icon {
        color: var(--mw-ink);
      }
      .arrow {
        align-self: center;
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--mw-primary);
        color: var(--mw-on-primary);
      }
      .arrow.rtl svg {
        transform: scaleX(-1);
      }
      .image {
        margin-top: var(--mw-gap);
      }
      .image img {
        width: 100%;
        max-height: 420px;
        object-fit: cover;
        border-radius: var(--mw-radius);
      }
      .cta {
        text-align: center;
        margin-top: clamp(24px, 4vw, 40px);
      }
      @media (max-width: 820px) {
        .cols {
          grid-template-columns: 1fr;
        }
        .arrow {
          justify-self: center;
          transform: rotate(90deg);
        }
        .arrow.rtl svg {
          transform: none;
        }
      }
    `,
  ];

  render() {
    const c = this.c;
    const title = txt(c.title);
    const subtitle = txt(c.subtitle);
    const problems = list<{ text?: unknown }>(c.problems).map((x) => txt(x?.text)).filter(Boolean);
    const solutions = list<{ text?: unknown }>(c.solutions).map((x) => txt(x?.text)).filter(Boolean);
    const image = safeImg(c.image);
    const ctaLabel = txt(c.cta_label);
    const ctaUrl = this.ctaHref(c.cta_link);
    const rtl = getComputedStyle(this).direction === 'rtl';

    return html`<section class="mw-section">
      <div class="mw-container">
        ${title || subtitle
          ? html`<header class="mw-head">
              ${title ? html`<h2 class="mw-title">${title}</h2>` : nothing}
              ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
            </header>`
          : nothing}
        <div class="cols">
          <div class="panel problem">
            <h3><span class="tag">${icon('x')}</span>${txt(c.problem_title, 'المشكلة')}</h3>
            <ul>
              ${problems.map((p) => html`<li>${icon('x')}<span>${p}</span></li>`)}
            </ul>
          </div>
          <div class="arrow ${rtl ? 'rtl' : ''}" aria-hidden="true">${icon('arrow')}</div>
          <div class="panel solution">
            <h3><span class="tag">${icon('check')}</span>${txt(c.solution_title, 'الحل')}</h3>
            <ul>
              ${solutions.map((s) => html`<li>${icon('check')}<span>${s}</span></li>`)}
            </ul>
          </div>
        </div>
        ${image ? html`<div class="image"><img src=${image} alt=${title} loading="lazy" decoding="async" /></div>` : nothing}
        ${ctaLabel ? html`<div class="cta"><a class="mw-btn" href=${ctaUrl}>${ctaLabel}</a></div>` : nothing}
      </div>
    </section>`;
  }
}
