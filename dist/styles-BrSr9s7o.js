import { css as r } from "lit";
const o = r`
  :host {
    --mw-primary: var(--mw-accent, var(--color-primary, var(--primary, #0f766e)));
    --mw-on-primary: var(--color-primary-reverse, #ffffff);
    --mw-ink: #13201f;
    --mw-muted: #5b6b69;
    --mw-line: rgba(19, 32, 31, 0.1);
    --mw-surface: #ffffff;
    --mw-bg: transparent;
    --mw-card: #ffffff;
    --mw-radius: 18px;
    --mw-radius-sm: 12px;
    --mw-shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px -12px rgba(16, 24, 40, 0.18);
    --mw-gap: clamp(16px, 2.5vw, 28px);
    --mw-pad-y: clamp(40px, 7vw, 88px);

    display: block;
    font-family: inherit;
    color: var(--mw-ink);
    line-height: 1.6;
    box-sizing: border-box;
  }

  /* Tones (chosen by the merchant per component) */
  :host([data-tone='tint']) {
    --mw-bg: color-mix(in srgb, var(--mw-primary) 7%, #ffffff);
  }
  :host([data-tone='primary']) {
    --mw-bg: var(--mw-primary);
    --mw-ink: var(--mw-on-primary);
    --mw-muted: color-mix(in srgb, var(--mw-on-primary) 78%, transparent);
    --mw-line: color-mix(in srgb, var(--mw-on-primary) 22%, transparent);
    --mw-card: color-mix(in srgb, #ffffff 10%, transparent);
  }
  :host([data-tone='dark']) {
    --mw-bg: #0f1716;
    --mw-ink: #f3f7f6;
    --mw-muted: #a9b7b5;
    --mw-line: rgba(255, 255, 255, 0.12);
    --mw-card: #18221f;
    --mw-surface: #18221f;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .mw-section {
    background: var(--mw-bg);
    padding-block: var(--mw-pad-y);
    padding-inline: 16px;
  }
  .mw-container {
    max-width: 1180px;
    margin-inline: auto;
  }
  .mw-head {
    text-align: center;
    max-width: 720px;
    margin: 0 auto clamp(24px, 4vw, 44px);
  }
  .mw-eyebrow {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--mw-primary);
    background: color-mix(in srgb, var(--mw-primary) 12%, transparent);
    padding: 6px 12px;
    border-radius: 999px;
    margin-bottom: 12px;
  }
  :host([data-tone='primary']) .mw-eyebrow {
    color: var(--mw-on-primary);
    background: rgba(255, 255, 255, 0.16);
  }
  .mw-title {
    font-size: clamp(1.5rem, 3.2vw, 2.4rem);
    line-height: 1.25;
    font-weight: 800;
    margin: 0 0 10px;
    color: var(--mw-ink);
    text-wrap: balance;
  }
  .mw-sub {
    font-size: clamp(0.98rem, 1.4vw, 1.12rem);
    color: var(--mw-muted);
    margin: 0;
    text-wrap: pretty;
  }

  .mw-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 12px 26px;
    border-radius: 999px;
    font: inherit;
    font-weight: 700;
    font-size: 1rem;
    text-decoration: none;
    border: 2px solid var(--mw-primary);
    background: var(--mw-primary);
    color: var(--mw-on-primary);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .mw-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px -10px color-mix(in srgb, var(--mw-primary) 70%, transparent);
  }
  .mw-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .mw-btn--ghost {
    background: transparent;
    color: var(--mw-primary);
  }
  :host([data-tone='primary']) .mw-btn {
    background: var(--mw-on-primary);
    color: var(--mw-primary);
    border-color: var(--mw-on-primary);
  }
  :host([data-tone='primary']) .mw-btn--ghost {
    background: transparent;
    color: var(--mw-on-primary);
  }
  :host([data-tone='dark']) .mw-btn--ghost {
    color: var(--mw-ink);
    border-color: var(--mw-line);
  }

  a:focus-visible,
  button:focus-visible,
  summary:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--mw-primary) 55%, #ffffff);
    outline-offset: 3px;
  }

  .mw-icon {
    width: 24px;
    height: 24px;
    flex: none;
  }

  /* Directional icons point the reading direction */
  .mw-flip:dir(rtl) {
    transform: scaleX(-1);
  }
  :host([dir='rtl']) .mw-flip {
    transform: scaleX(-1);
  }

  img {
    max-width: 100%;
    display: block;
  }

  .mw-empty {
    padding: 24px;
    border: 2px dashed var(--mw-line);
    border-radius: var(--mw-radius);
    text-align: center;
    color: var(--mw-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;
export {
  o as b
};
