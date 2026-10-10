# Mawsim · موسم — Campaign Landing Kit for Salla

Arabic-first landing page components for **Salla** seasonal campaigns and product launches.
Sold as a Component Bundle on the Salla Themes Marketplace.

- **11 components** — Lit web components, RTL-first, responsive, keyboard-accessible
- **Overlay product board** — buttons open a festive full-screen board with the campaign
  products, 3D-tilt cards, quick view, gallery, quantity and add-to-cart — without leaving the page
- **Interactive festive scenes** — swinging Ramadan lanterns, glowing crescent, falling 3D
  snowballs, confetti and golden stars that react to mouse, touch and phone tilt
- **4 ready templates** — Product Launch (default), Ramadan, White Friday, Saudi National Day
- Follows the merchant's theme color automatically, with automatic contrast correction
- Zero external images or fonts — nothing to break, nothing to host

| Component | What it does |
|---|---|
| `mawsim-festive-layer` | Snow / golden stars / confetti falling over the whole page, tap for sparks, on/off button |
| `mawsim-hero` | Headline, one main CTA, photo / cover / decoration, optional interactive scene background |
| `mawsim-countdown` | Offer timer, Arabic digits option, auto-hide when expired |
| `mawsim-product-spotlight` | Up to 8 chosen products, live prices, add-to-cart, quick view in the overlay board |
| `mawsim-problem-solution` | Before → after panels |
| `mawsim-benefits` | Icon grid of key benefits |
| `mawsim-testimonials` | Reviews with stars and average score, swipeable on mobile |
| `mawsim-comparison` | "Us vs. others" table |
| `mawsim-faq` | Accordion FAQ + WhatsApp/contact button |
| `mawsim-trust-badges` | Shipping / payment / returns / support strip |
| `mawsim-sticky-cta` | Closing banner + sticky bottom bar that appears on scroll |

Any button whose link is left empty opens the **overlay board** with the Product Spotlight's
products (or scrolls to that section, if the merchant chooses "scroll").

### Festive scenes

| Scene | Where | Interaction |
|---|---|---|
| `ramadan` | hero, board | fanous lanterns swing when the pointer passes, tap → swing + golden sparks; crescent + twinkling stars |
| `snow` | hero, board, page layer | 3D-shaded snowballs with depth parallax, blown away from the pointer |
| `ramadan-snow` | hero, board | both together |
| `confetti` | hero, board, page layer | flipping confetti in the store's colors |
| `stars` | hero, board, page layer | falling golden stars and small crescents |

All scenes pause when off-screen or in a background tab, cap the pixel ratio on phones,
and show a still frame when the visitor has "reduce motion" turned on.

---

## Requirements

- Node.js 18+ and **pnpm** (`npm i -g pnpm`) — the Salla SDK refuses npm/yarn installs
- Salla CLI (`npm i -g @salla.sa/cli`) — only for `salla login` (needed by the public preview)
- A Salla Partners account and a demo store

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # Salla's local demo page with a settings sidebar
pnpm run check        # validate bundle rules + type-check + build  ← run before every push
pnpm build            # production build into dist/
salla login           # once, links your Partners account
pnpm preview:public   # shareable preview link on salla.design (after build)
```

## Project structure

```
src/
  components/<name>/index.ts   one folder per component (entry file)
  shared/                      base element, design tokens, icons, helpers
    scene.ts                   interactive festive canvas (lanterns, snow, confetti, stars)
    board.ts                   overlay product board + quick view
    products.ts                product fetching cache, campaign registry, HTML sanitizer
templates/*.json               seasonal templates (component order + values)
twilight-bundle.json           bundle manifest: components, merchant settings, templates
scripts/
  generate-manifest.py         regenerates twilight-bundle.json + templates (edit settings here)
  validate-bundle.mjs          pre-publish checks (1–15 components, no header/footer, keys…)
docs/
  merchant-guide.html          merchant documentation (use as the listing's Documentation Link)
  previews/                    screenshots used as component and template previews
```

## Editing merchant settings or templates

Settings and template copy live in `scripts/generate-manifest.py` so every component, key
and template stays consistent. After editing:

```bash
python3 scripts/generate-manifest.py
pnpm run check
```

Component keys are derived from the component name — **never rename a component after
publishing**, or stores lose their saved settings.

## Publishing on Salla

1. This code lives in **`melsukkari/salla-snowfalls`**, branch **`master`**
   (the previous theme is saved in the `backup-snowfalls-theme` branch).
2. Salla Partners → **Bundles** → **Import Bundle from GitHub** → choose the repo.
   When asked for a bundle name use one starting with `tw-`, e.g. `tw-mawsim-landing-kit`.
3. Set the bundle type to **Template Landing Page**, pick the `master` branch.
4. Install on your demo store and test every template (Arabic + English, phone + desktop).
5. Listing: upload screenshots from `docs/previews/`, set the price, and use the hosted
   `docs/merchant-guide.html` as the Documentation Link.
6. Submit for review.

### Preview images

`twilight-bundle.json` points component previews at
`raw.githubusercontent.com/melsukkari/salla-snowfalls/master/docs/previews/…`.
These load only while the repository is **public**. If you keep it private, upload
`docs/previews/` to your own server (e.g. `https://tholth.com/mawsim/previews/`), change
`PREVIEW_BASE` in `scripts/generate-manifest.py`, and re-run it.

## Scaling to more bundles

The `src/shared/` folder is the reusable core. For a new niche bundle
(e.g. `tw-mawsim-perfume`, `tw-mawsim-fashion`): copy the repo, keep `shared/`,
add or reskin components, rename the component prefix, and edit the generator.
Each bundle is a separate marketplace listing.

## License

Proprietary — © Sukkari. Sold through the Salla Themes Marketplace; not for redistribution.
