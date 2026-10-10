import { sallaReady } from './utils';

export type Money = number | { amount: number; currency: string };

export interface MwProduct {
  id: number | string;
  name: string;
  url: string;
  description?: string;
  subtitle?: string | null;
  promotion_title?: string | null;
  image?: { url?: string; alt?: string | null };
  images?: Array<{ url?: string; alt?: string | null; type?: string }>;
  price?: Money;
  sale_price?: Money;
  regular_price?: Money;
  is_on_sale?: boolean;
  is_available?: boolean;
  is_out_of_stock?: boolean;
  max_quantity?: number;
  options?: unknown[];
  has_options?: boolean;
}

const cache = new Map<string, Promise<MwProduct | null>>();

/** Fetch one product's details (cached for the page's lifetime). */
export function fetchProduct(id: number | string): Promise<MwProduct | null> {
  const key = String(id);
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const s = await sallaReady();
        if (!s?.product?.api?.getDetails) return null;
        try {
          const res = await s.product.api.getDetails(id);
          return (res?.data as MwProduct) || null;
        } catch (e) {
          s?.log?.('Mawsim: could not load product', id, e);
          cache.delete(key);
          return null;
        }
      })(),
    );
  }
  return cache.get(key)!;
}

export async function fetchProducts(ids: Array<number | string>): Promise<MwProduct[]> {
  const list = await Promise.all(ids.map((id) => fetchProduct(id)));
  return list.filter((p): p is MwProduct => !!p);
}

export function needsOptions(p: MwProduct): boolean {
  return !!(p.has_options || (Array.isArray(p.options) && p.options.length));
}

export function isUnavailable(p: MwProduct): boolean {
  return p.is_available === false || p.is_out_of_stock === true;
}

export function productImages(p: MwProduct): string[] {
  const urls = [p.image?.url, ...(p.images || []).filter((i) => !i.type || i.type === 'image').map((i) => i.url)]
    .filter((u): u is string => !!u && /^(https?:\/\/|\/|data:image\/)/i.test(u));
  return Array.from(new Set(urls)).slice(0, 8);
}

/** Strip scripts, embeds, inline handlers and javascript: links from product description HTML. */
export function cleanHtml(html: string | undefined): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,form,link,meta,base').forEach((n) => n.remove());
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
    }
  });
  return doc.body.firstElementChild?.innerHTML || '';
}

/** Campaign registered by the Product Spotlight so any button on the page can open it. */
export interface Campaign {
  ids: Array<number | string>;
  title?: string;
  subtitle?: string;
  scene?: string;
  accent?: string;
}

const KEY = '__mawsimCampaign';

export function registerCampaign(c: Campaign) {
  (window as any)[KEY] = c;
}

export function getCampaign(): Campaign | undefined {
  const c = (window as any)[KEY] as Campaign | undefined;
  return c && c.ids?.length ? c : undefined;
}
