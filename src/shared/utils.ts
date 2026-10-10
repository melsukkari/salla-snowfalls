/**
 * Mawsim shared helpers.
 * Every component imports from here; Vite bundles it into a shared chunk,
 * so each component still works on its own on any page.
 */

type AnyRecord = Record<string, any>;

/** Salla global (undefined in plain HTML previews). */
export function salla(): any {
  return (window as any).Salla;
}

/** Current storefront language: 'ar' or 'en'. */
export function lang(): 'ar' | 'en' {
  const s = salla();
  const fromSalla = s?.config?.get?.('user.language_code') || s?.lang?.locale;
  const fromDoc = document.documentElement.lang;
  const code = String(fromSalla || fromDoc || 'ar').toLowerCase();
  return code.startsWith('en') ? 'en' : 'ar';
}

export function isRtl(): boolean {
  const dir = document.documentElement.dir || document.body?.dir;
  if (dir) return dir.toLowerCase() === 'rtl';
  return lang() === 'ar';
}

/**
 * Resolve a text value. Salla normally flattens multilingual fields to a string,
 * but we also accept {ar, en} objects so the component never prints [object Object].
 */
export function txt(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim() ? value : fallback;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    const v = value as AnyRecord;
    const l = lang();
    const picked = v[l] || v.ar || v.en || Object.values(v).find((x) => typeof x === 'string' && x.trim());
    return typeof picked === 'string' && picked.trim() ? picked : fallback;
  }
  return fallback;
}

/** Pick the selected value from an items field (dropdown / radio list). */
export function pick<T extends string>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === 'object') return (first.value ?? first.key ?? fallback) as T;
    return (first ?? fallback) as T;
  }
  if (typeof value === 'object') {
    const v = value as AnyRecord;
    return (v.value ?? v.key ?? fallback) as T;
  }
  return String(value) as T;
}

/** IDs from a product (or other source) dropdown. */
export function ids(value: unknown): Array<number | string> {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .map((x) => (x && typeof x === 'object' ? (x as AnyRecord).value ?? (x as AnyRecord).id : x))
    .filter((x) => x !== null && x !== undefined && x !== '');
}

export function list<T = AnyRecord>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function bool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  return fallback;
}

export function num(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

/** Only allow safe link schemes; anything else becomes '#'. */
export function safeUrl(value: unknown): string {
  const url = txt(value).trim();
  if (!url) return '';
  if (/^(https?:|mailto:|tel:|\/|#|\?)/i.test(url)) return url;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url)) return `https://${url}`;
  return '#';
}

/** Only allow http(s) / relative images. */
export function safeImg(value: unknown): string {
  const url = txt(value).trim();
  if (!url) return '';
  return /^(https?:\/\/|\/|data:image\/)/i.test(url) ? url : '';
}

/** Format a price with Salla's money helper when available. */
export function money(amount: unknown): string {
  const s = salla();
  if (amount && typeof amount === 'object') {
    const a = amount as AnyRecord;
    if (s?.money) return s.money(a);
    return `${a.amount ?? ''} ${a.currency ?? ''}`.trim();
  }
  const n = num(amount, NaN);
  if (!Number.isFinite(n)) return '';
  if (s?.money) return s.money(n);
  return `${n.toLocaleString(lang() === 'ar' ? 'ar-SA' : 'en-US')} ${lang() === 'ar' ? 'ر.س' : 'SAR'}`;
}

/** Wait for Salla to be ready, but never hang forever (plain previews). */
export async function sallaReady(timeoutMs = 4000): Promise<any> {
  const s = salla();
  if (!s?.onReady) return undefined;
  await Promise.race([s.onReady(), new Promise((r) => setTimeout(r, timeoutMs))]);
  return salla();
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Built-in labels in both languages. */
const LABELS: Record<string, { ar: string; en: string }> = {
  add_to_cart: { ar: 'أضف للسلة', en: 'Add to cart' },
  added: { ar: 'تمت الإضافة للسلة', en: 'Added to cart' },
  view: { ar: 'عرض المنتج', en: 'View product' },
  out_of_stock: { ar: 'نفدت الكمية', en: 'Out of stock' },
  days: { ar: 'يوم', en: 'Days' },
  hours: { ar: 'ساعة', en: 'Hours' },
  minutes: { ar: 'دقيقة', en: 'Min' },
  seconds: { ar: 'ثانية', en: 'Sec' },
  close: { ar: 'إغلاق', en: 'Close' },
  pick_products: { ar: 'اختر المنتجات من إعدادات العنصر', en: 'Choose products in the component settings' },
  error: { ar: 'تعذّر تنفيذ الطلب، حاول مرة أخرى', en: 'Something went wrong, please try again' },
  quantity: { ar: 'الكمية', en: 'Quantity' },
  checkout: { ar: 'إتمام الطلب', en: 'Checkout' },
  keep_shopping: { ar: 'متابعة التسوق', en: 'Keep shopping' },
  back: { ar: 'رجوع للمنتجات', en: 'Back to products' },
  choose_options: { ar: 'اختر المقاس/اللون من صفحة المنتج', en: 'Choose size/colour on the product page' },
  options_note: { ar: 'هذا المنتج له خيارات، اختر ما يناسبك من صفحة المنتج.', en: 'This product has options — pick yours on the product page.' },
  added_long: { ar: 'تمت الإضافة إلى سلتك بنجاح 🎉', en: 'Added to your cart 🎉' },
  quick_view: { ar: 'عرض سريع', en: 'Quick view' },
  increase: { ar: 'زيادة', en: 'Increase' },
  decrease: { ar: 'إنقاص', en: 'Decrease' },
  details: { ar: 'تفاصيل المنتج', en: 'Product details' },
  loading: { ar: 'جارٍ التحميل…', en: 'Loading…' },
  campaign: { ar: 'منتجات العرض', en: 'Offer products' },
};

export function label(key: keyof typeof LABELS | string): string {
  const entry = LABELS[key];
  if (!entry) return key;
  return entry[lang()];
}
