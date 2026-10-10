import { css, html, nothing, PropertyValues, svg } from 'lit';
import { MawsimBase } from '../../shared/base';
import { baseStyles } from '../../shared/styles';
import { FestiveScene, SceneKind } from '../../shared/scene';
import { isRtl, pick, safeImg, safeUrl, txt } from '../../shared/utils';

type Layout = 'split' | 'split-reverse' | 'cover';
type Decor = 'none' | 'crescent' | 'geometric' | 'sparkle' | 'waves';

/** Decorative art used when the hero has no photo (pure SVG, no external files). */
function decorArt(kind: Decor) {
  switch (kind) {
    case 'crescent':
      return svg`<g fill="currentColor">
        <path d="M410 70a90 90 0 1 0 80 132 72 72 0 1 1-80-132z" opacity=".9"/>
        <path d="M520 60l6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z" opacity=".8"/>
        <path d="M90 50l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" opacity=".55"/>
        <path d="M560 210l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" opacity=".6"/>
        <line x1="300" y1="0" x2="300" y2="70" stroke="currentColor" stroke-width="2" opacity=".5"/>
        <path d="M285 70h30l-4 30h-22z" opacity=".55"/><circle cx="300" cy="112" r="10" opacity=".45"/>
      </g>`;
    case 'geometric':
      return svg`<g fill="none" stroke="currentColor" stroke-width="2" opacity=".75">
        ${[80, 230, 380, 530].map(
          (x) => svg`<g transform="translate(${x} 110)"><rect x="-46" y="-46" width="92" height="92"/><rect x="-46" y="-46" width="92" height="92" transform="rotate(45)"/><circle r="22"/></g>`,
        )}
      </g>`;
    case 'sparkle':
      return svg`<g fill="currentColor">
        ${[
          [70, 60, 1], [180, 170, 0.6], [300, 50, 0.8], [420, 160, 1.2], [540, 70, 0.7],
        ].map(
          ([x, y, k]) => svg`<path transform="translate(${x} ${y}) scale(${k})" d="M0-34C4-8 8-4 34 0 8 4 4 8 0 34-4 8-8 4-34 0-8-4-4-8 0-34z"/>`,
        )}
      </g>`;
    case 'waves':
      return svg`<g fill="none" stroke="currentColor" stroke-width="2.5" opacity=".8">
        ${[40, 80, 120, 160, 200].map(
          (y) => svg`<path d="M0 ${y} C100 ${y - 30} 200 ${y + 30} 300 ${y} S500 ${y - 30} 600 ${y}"/>`,
        )}
      </g>`;
    default:
      return nothing;
  }
}

/** Mawsim Hero — one clear goal, one strong call to action, optional interactive festive scene. */
export default class MawsimHero extends MawsimBase {
  private scene?: FestiveScene;
  private sceneCanvas?: HTMLCanvasElement;
  private sceneKey = '';

  static styles = [
    baseStyles,
    css`
      .mw-section {
        overflow-x: clip;
        position: relative;
      }
      .mw-section.has-scene {
        overflow: hidden;
        min-height: clamp(420px, 60vw, 640px);
        display: grid;
        align-items: center;
      }
      canvas.scene {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 0;
        touch-action: pan-y;
      }
      .has-scene .mw-container,
      .cover .copy {
        position: relative;
        z-index: 1;
        width: 100%;
      }
      .cover canvas.scene {
        z-index: 1;
      }
      .cover .copy {
        z-index: 2;
      }
      .mw-section.has-scene {
        padding-top: max(var(--mw-pad-y), 120px);
      }
      @media (max-width: 640px) {
        .mw-section.has-scene {
          padding-top: 150px;
          min-height: 0;
        }
      }
      .has-scene .solo .mw-title {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }
      .hero {
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        align-items: center;
        gap: clamp(24px, 5vw, 64px);
      }
      .hero.split-reverse .media {
        order: -1;
      }
      .copy {
        text-align: start;
      }
      .mw-title {
        font-size: clamp(1.9rem, 4.6vw, 3.4rem);
        margin-bottom: 14px;
      }
      .mw-sub {
        font-size: clamp(1rem, 1.6vw, 1.2rem);
        max-width: 56ch;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }
      .note {
        margin-top: 14px;
        font-size: 0.9rem;
        color: var(--mw-muted);
      }
      .media {
        position: relative;
      }
      .media img {
        width: 100%;
        aspect-ratio: 4 / 3.4;
        object-fit: cover;
        border-radius: calc(var(--mw-radius) + 6px);
        box-shadow: var(--mw-shadow);
      }
      .badge {
        position: absolute;
        inset-block-end: 18px;
        inset-inline-start: -14px;
        background: var(--mw-surface);
        color: var(--mw-ink);
        border-radius: 14px;
        padding: 10px 16px;
        font-weight: 800;
        box-shadow: var(--mw-shadow);
        border-inline-start: 4px solid var(--mw-primary);
        max-width: 80%;
      }
      :host([data-tone='primary']) .badge {
        color: #13201f;
        background: #ffffff;
      }

      /* Cover layout: image behind the text */
      .cover {
        position: relative;
        border-radius: calc(var(--mw-radius) + 8px);
        overflow: hidden;
        min-height: clamp(380px, 56vw, 600px);
        display: grid;
        align-items: end;
        background: #0f1716 center / cover no-repeat;
      }
      .cover::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(8, 14, 13, 0.82) 8%, rgba(8, 14, 13, 0.25) 60%, transparent);
      }
      .cover .copy {
        position: relative;
        z-index: 1;
        padding: clamp(24px, 5vw, 56px);
        max-width: 760px;
        color: #ffffff;
        --mw-ink: #ffffff;
        --mw-muted: rgba(255, 255, 255, 0.86);
      }
      .cover .mw-btn--ghost {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.7);
      }
      .cover-section {
        padding-block: clamp(16px, 3vw, 32px);
      }

      /* No photo: centered layout with optional decorative art */
      .solo {
        position: relative;
        text-align: center;
        max-width: 860px;
        margin-inline: auto;
        padding-block: clamp(12px, 3vw, 28px);
      }
      .solo .copy {
        text-align: center;
        position: relative;
        z-index: 1;
      }
      .solo .mw-sub {
        margin-inline: auto;
      }
      .solo .actions {
        justify-content: center;
      }
      .decor {
        position: absolute;
        inset: -10% -8% auto;
        width: 116%;
        height: auto;
        color: var(--mw-primary);
        opacity: 0.16;
        pointer-events: none;
        z-index: 0;
      }
      :host([data-tone='primary']) .decor,
      :host([data-tone='dark']) .decor {
        color: #ffffff;
        opacity: 0.14;
      }

      @media (max-width: 820px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .hero.split-reverse .media,
        .hero .media {
          order: -1;
        }
        .badge {
          inset-inline-start: 12px;
        }
        .actions .mw-btn {
          flex: 1 1 auto;
        }
      }
    `,
  ];

  private sceneKind(): SceneKind {
    return pick<SceneKind>(this.c.scene, 'none');
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    this.syncScene();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.scene?.destroy();
    this.scene = undefined;
    this.sceneCanvas = undefined;
    this.sceneKey = '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) this.syncScene();
  }

  /** Create / update / remove the festive canvas to match the settings. */
  private syncScene() {
    const canvas = this.renderRoot.querySelector('canvas.scene') as HTMLCanvasElement | null;
    const kind = this.sceneKind();
    if (!canvas || kind === 'none') {
      this.scene?.destroy();
      this.scene = undefined;
      this.sceneCanvas = undefined;
      this.sceneKey = '';
      return;
    }
    const tone = this.getAttribute('data-tone');
    const accent = getComputedStyle(this).getPropertyValue('--mw-primary').trim() || '#0f766e';
    const density = parseFloat(pick(this.c.scene_density, '1')) || 1;
    const onLight = !tone || tone === 'tint';
    const key = [kind, accent, density, onLight].join('|');
    if (this.scene && this.sceneCanvas === canvas) {
      if (key !== this.sceneKey) this.scene.update({ kind, accent, density, onLight });
    } else {
      this.scene?.destroy();
      this.scene = new FestiveScene(canvas, {
        kind,
        accent,
        density,
        onLight,
        rtl: isRtl(),
        pointerTarget: this,
      });
      this.sceneCanvas = canvas;
    }
    this.sceneKey = key;
  }

  private renderCopy() {
    const c = this.c;
    const eyebrow = txt(c.eyebrow);
    const title = txt(c.title, 'عنوان واضح يشرح القيمة في سطر واحد');
    const subtitle = txt(c.subtitle);
    const ctaLabel = txt(c.cta_label);
    const ctaUrl = this.ctaHref(c.cta_link);
    const secLabel = txt(c.secondary_label);
    const secUrl = safeUrl(c.secondary_link);
    const note = txt(c.note);

    return html`<div class="copy">
      ${eyebrow ? html`<span class="mw-eyebrow">${eyebrow}</span>` : nothing}
      <h1 class="mw-title">${title}</h1>
      ${subtitle ? html`<p class="mw-sub">${subtitle}</p>` : nothing}
      ${ctaLabel || (secLabel && secUrl)
        ? html`<div class="actions">
            ${ctaLabel ? html`<a class="mw-btn" href=${ctaUrl}>${ctaLabel}</a>` : nothing}
            ${secLabel && secUrl
              ? html`<a class="mw-btn mw-btn--ghost" href=${secUrl}>${secLabel}</a>`
              : nothing}
          </div>`
        : nothing}
      ${note ? html`<p class="note">${note}</p>` : nothing}
    </div>`;
  }

  render() {
    const layout = pick<Layout>(this.c.layout, 'split');
    const image = safeImg(this.c.image);
    const badge = txt(this.c.badge);
    const alt = txt(this.c.image_alt, txt(this.c.title));

    if (layout === 'cover' && image) {
      return html`<section class="mw-section cover-section">
        <div class="mw-container">
          <div class="cover" style="background-image:url('${image.replace(/'/g, '%27')}')" role="img" aria-label=${alt}>
            ${this.sceneKind() !== 'none' ? html`<canvas class="scene" aria-hidden="true"></canvas>` : nothing}
            ${this.renderCopy()}
          </div>
        </div>
      </section>`;
    }

    if (!image) {
      const decor = pick<Decor>(this.c.decor, 'none');
      const hasScene = this.sceneKind() !== 'none';
      return html`<section class="mw-section ${hasScene ? 'has-scene' : ''}">
        ${hasScene ? html`<canvas class="scene" aria-hidden="true"></canvas>` : nothing}
        <div class="mw-container solo">
          ${decor !== 'none' && !hasScene
            ? html`<svg class="decor" viewBox="0 0 600 240" aria-hidden="true" focusable="false">${decorArt(decor)}</svg>`
            : nothing}
          ${this.renderCopy()}
        </div>
      </section>`;
    }

    const hasScene = this.sceneKind() !== 'none';
    return html`<section class="mw-section ${hasScene ? 'has-scene' : ''}">
      ${hasScene ? html`<canvas class="scene" aria-hidden="true"></canvas>` : nothing}
      <div class="mw-container hero ${layout}">
        ${this.renderCopy()}
        <div class="media">
          <img src=${image} alt=${alt} loading="eager" fetchpriority="high" decoding="async" />
          ${badge ? html`<div class="badge">${badge}</div>` : nothing}
        </div>
      </div>
    </section>`;
  }
}
