import { css, html, nothing, PropertyValues } from 'lit';
import { state } from 'lit/decorators.js';
import { MawsimBase, Tone } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { icon } from '../../shared/icons';
import { bool, label, lang, txt } from '../../shared/utils';

/** Mawsim Countdown — urgency bar that counts down to the offer end time. */
export default class MawsimCountdown extends MawsimBase {
  protected defaultTone: Tone = 'primary';

  @state() private remaining = 0;
  private timer?: number;

  static styles = [
    baseStyles,
    css`
      .mw-section {
        padding-block: clamp(22px, 4vw, 40px);
      }
      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 18px 28px;
      }
      .copy {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }
      .copy .mw-icon {
        width: 34px;
        height: 34px;
        opacity: 0.9;
      }
      .title {
        font-size: clamp(1.1rem, 2.2vw, 1.45rem);
        font-weight: 800;
        margin: 0;
        line-height: 1.3;
      }
      .sub {
        margin: 2px 0 0;
        color: var(--mw-muted);
        font-size: 0.95rem;
      }
      .clock {
        display: flex;
        gap: 10px;
        direction: ltr;
      }
      .unit {
        min-width: 68px;
        text-align: center;
        background: var(--mw-card);
        border: 1px solid var(--mw-line);
        border-radius: var(--mw-radius-sm);
        padding: 10px 8px 8px;
      }
      :host(:not([data-tone])) .unit,
      :host([data-tone='tint']) .unit {
        box-shadow: var(--mw-shadow);
      }
      .num {
        display: block;
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 800;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .lbl {
        display: block;
        margin-top: 6px;
        font-size: 0.75rem;
        color: var(--mw-muted);
      }
      .expired {
        font-weight: 700;
      }
      @media (max-width: 640px) {
        .bar {
          justify-content: center;
          text-align: center;
        }
        .copy {
          flex-direction: column;
        }
        .clock {
          width: 100%;
          justify-content: center;
        }
        .unit {
          flex: 1;
          min-width: 0;
        }
        .bar .mw-btn {
          width: 100%;
        }
      }
    `,
  ];

  private endTime(): number {
    const raw = txt(this.c.end_datetime).trim();
    if (!raw) return NaN;
    // "2026-11-27T23:59" style values are local store time
    const t = new Date(raw.replace(' ', 'T')).getTime();
    return t;
  }

  private tick = () => {
    const end = this.endTime();
    this.remaining = Number.isFinite(end) ? Math.max(0, end - Date.now()) : 0;
    if (this.remaining <= 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.start();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    // Recalculate before rendering so a changed end time shows immediately
    if (changed.has('config') && this.isConnected) this.start();
  }

  private start() {
    if (this.timer) clearInterval(this.timer);
    this.tick();
    if (this.remaining > 0) this.timer = window.setInterval(this.tick, 1000);
  }

  private fmt(n: number): string {
    const s = String(n).padStart(2, '0');
    return lang() === 'ar' && bool(this.c.arabic_digits, false)
      ? s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
      : s;
  }

  render() {
    const c = this.c;
    const title = txt(c.title, 'العرض ينتهي قريباً');
    const subtitle = txt(c.subtitle);
    const ctaLabel = txt(c.cta_label);
    const ctaUrl = this.ctaHref(c.cta_link);
    const hasEnd = Number.isFinite(this.endTime());
    const expired = hasEnd && this.remaining <= 0;

    if (expired && bool(c.hide_when_expired, false)) return nothing;

    const total = Math.floor(this.remaining / 1000);
    const parts = [
      { v: Math.floor(total / 86400), l: label('days') },
      { v: Math.floor((total % 86400) / 3600), l: label('hours') },
      { v: Math.floor((total % 3600) / 60), l: label('minutes') },
      { v: total % 60, l: label('seconds') },
    ];
    // In RTL the visual order should still read days → seconds from the start side
    const ordered = getComputedStyle(this).direction === 'rtl' ? [...parts].reverse() : parts;

    return html`<section class="mw-section" aria-live="off">
      <div class="mw-container bar">
        <div class="copy">
          ${icon('clock')}
          <div>
            <p class="title">${expired ? txt(c.expired_text, 'انتهى العرض') : title}</p>
            ${subtitle && !expired ? html`<p class="sub">${subtitle}</p>` : nothing}
          </div>
        </div>
        ${hasEnd && !expired
          ? html`<div class="clock" role="timer" aria-label=${title}>
              ${ordered.map(
                (p) => html`<div class="unit">
                  <span class="num">${this.fmt(p.v)}</span><span class="lbl">${p.l}</span>
                </div>`,
              )}
            </div>`
          : nothing}
        ${!hasEnd ? html`<div class="mw-empty">حدد تاريخ ووقت نهاية العرض</div>` : nothing}
        ${ctaLabel && !expired ? html`<a class="mw-btn" href=${ctaUrl}>${ctaLabel}</a>` : nothing}
      </div>
    </section>`;
  }
}
