import { html, svg, TemplateResult } from 'lit';

/**
 * Inline SVG icons (Salla's icon font does not reach inside shadow DOM,
 * so the bundle ships its own small set). Stroke icons, 24x24, currentColor.
 */
const paths: Record<string, TemplateResult> = {
  check: svg`<path d="M20 6 9 17l-5-5"/>`,
  x: svg`<path d="M18 6 6 18M6 6l12 12"/>`,
  truck: svg`<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>`,
  shield: svg`<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>`,
  card: svg`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>`,
  return: svg`<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>`,
  star: svg`<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>`,
  gift: svg`<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 4s.5 4 4 4zM12 8s1.5-5 4-4-.5 4-4 4z"/>`,
  clock: svg`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  chat: svg`<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>`,
  sparkle: svg`<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>`,
  heart: svg`<path d="M20.8 8.6a5 5 0 0 0-8.8-3.2 5 5 0 0 0-8.8 3.2c0 5.4 8.8 11 8.8 11s8.8-5.6 8.8-11z"/>`,
  leaf: svg`<path d="M5 19c8 0 14-6 14-15-9 0-15 6-15 14z"/><path d="M5 19 13 11"/>`,
  bolt: svg`<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>`,
  medal: svg`<circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 3h4l2 4 2-4h4l-2.5 7"/>`,
  phone: svg`<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>`,
  moon: svg`<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>`,
  tag: svg`<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>`,
  arrow: svg`<path d="M5 12h14M13 6l6 6-6 6"/>`,
  chevron: svg`<path d="m6 9 6 6 6-6"/>`,
};

export const ICON_OPTIONS = [
  { label: 'صح ✓', value: 'check' },
  { label: 'شحن', value: 'truck' },
  { label: 'ضمان / حماية', value: 'shield' },
  { label: 'دفع', value: 'card' },
  { label: 'استرجاع', value: 'return' },
  { label: 'نجمة', value: 'star' },
  { label: 'هدية', value: 'gift' },
  { label: 'وقت', value: 'clock' },
  { label: 'دعم / محادثة', value: 'chat' },
  { label: 'تميّز', value: 'sparkle' },
  { label: 'قلب', value: 'heart' },
  { label: 'طبيعي', value: 'leaf' },
  { label: 'سرعة', value: 'bolt' },
  { label: 'جودة', value: 'medal' },
  { label: 'هاتف', value: 'phone' },
  { label: 'هلال', value: 'moon' },
  { label: 'عرض / سعر', value: 'tag' },
];

export function icon(name: string, cls = 'mw-icon'): TemplateResult {
  const p = paths[name] || paths.check;
  return html`<svg
    class=${cls}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >${p}</svg>`;
}
