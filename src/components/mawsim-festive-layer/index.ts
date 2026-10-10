import { css, html, nothing, PropertyValues } from 'lit';
import { state } from 'lit/decorators.js';
import { MawsimBase } from '../../shared/base';
import { FestiveScene, SceneKind } from '../../shared/scene';
import { bool, isRtl, label, num, pick, prefersReducedMotion } from '../../shared/utils';

/** Mawsim Festive Layer — snow, stars or confetti falling over the whole page; reacts to touch. */
export default class MawsimFestiveLayer extends MawsimBase {
  @state() private hidden_ = false;
  @state() private fading = false;
  private scene?: FestiveScene;
  private sceneKey = '';
  private timer?: number;

  static styles = css`
    :host {
      display: block;
      height: 0;
    }
    canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 45;
      opacity: 1;
      transition: opacity 1.2s ease;
    }
    canvas.fade {
      opacity: 0;
    }
    .toggle {
      position: fixed;
      inset-block-end: calc(84px + env(safe-area-inset-bottom, 0px));
      inset-inline-end: 14px;
      z-index: 46;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 0;
      background: rgba(19, 32, 31, 0.72);
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(6px);
    }
    .toggle:focus-visible {
      outline: 3px solid #ffffff;
      outline-offset: 2px;
    }
    @media (max-width: 640px) {
      :host([data-desktop-only]) canvas,
      :host([data-desktop-only]) .toggle {
        display: none;
      }
    }
  `;

  private kind(): SceneKind {
    const k = pick<SceneKind>(this.c.effect, 'snow');
    // hanging lanterns need a section; on a page layer Ramadan means falling stars + crescents
    if (k === 'ramadan') return 'stars';
    if (k === 'ramadan-snow') return 'snow';
    return k;
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (bool(this.c.desktop_only, false)) this.setAttribute('data-desktop-only', '');
    else this.removeAttribute('data-desktop-only');
    this.sync();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.scene?.destroy();
    this.scene = undefined;
    this.sceneKey = '';
    clearTimeout(this.timer);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) this.sync();
  }

  private sync() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas || this.hidden_ || prefersReducedMotion()) {
      this.scene?.destroy();
      this.scene = undefined;
      this.sceneKey = '';
      return;
    }
    const kind = this.kind();
    const accent = getComputedStyle(this).getPropertyValue('--mw-primary').trim() || '#0f766e';
    const density = num(pick(this.c.density, '1'), 1) * 0.6;
    const key = [kind, accent, density].join('|');
    if (!this.scene) {
      this.scene = new FestiveScene(canvas, {
        kind,
        mode: 'page',
        accent,
        density,
        rtl: isRtl(),
        pointerTarget: window,
        onLight: true,
      });
      const seconds = num(this.c.duration, 0);
      clearTimeout(this.timer);
      if (seconds > 0) this.timer = window.setTimeout(() => this.stop(), seconds * 1000);
    } else if (key !== this.sceneKey) {
      this.scene.update({ kind, accent, density });
    }
    this.sceneKey = key;
  }

  /** Fade out, then free the canvas. */
  private stop() {
    this.fading = true;
    window.setTimeout(() => {
      this.hidden_ = true;
      this.fading = false;
    }, 1200);
  }

  private toggle() {
    if (this.hidden_) {
      this.hidden_ = false;
    } else {
      this.stop();
    }
  }

  render() {
    if (prefersReducedMotion()) return nothing;
    const showToggle = bool(this.c.show_toggle, true);
    return html`
      ${this.hidden_ ? nothing : html`<canvas class=${this.fading ? 'fade' : ''} aria-hidden="true"></canvas>`}
      ${showToggle
        ? html`<button
            class="toggle"
            type="button"
            aria-pressed=${this.hidden_ ? 'false' : 'true'}
            aria-label=${this.hidden_ ? '✨' : label('close')}
            title=${this.hidden_ ? '✨' : label('close')}
            @click=${this.toggle}
          >
            ${this.hidden_ ? '✨' : '❄'}
          </button>`
        : nothing}
    `;
  }
}
