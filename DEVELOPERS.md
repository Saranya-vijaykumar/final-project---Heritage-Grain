# Heritage & Grain — Developer Guide

A furniture repair & restoration template built for reuse: plain HTML5, Bootstrap 5,
CSS custom properties and vanilla JavaScript. No React, no JSX, no build step.

## Design principles

1. **Modern UI/UX with Bootstrap 5.3** — grid, utilities, offcanvas, dropdowns and
   collapse come from Bootstrap; the brand layer lives in `assets/css/theme.css`.
2. **Mobile-first responsive** — base styles target small screens, `sm: md: lg:`
   breakpoints add complexity upward.
3. **Dark + light modes** — `data-bs-theme="dark|light"` on `<html>`; every colour is
   a CSS variable so both modes resolve automatically.
4. **RTL compatible** — `dir="rtl"` on `<html>`; `assets/js/theme.js` swaps in
   `bootstrap.rtl.min.css`, and layout uses logical properties plus `.flip-rtl`
   for directional icons.
5. **Clean, semantic markup** — `header / nav / main / section / article / footer`,
   one `<h1>` per page, labelled form controls, `aria-*` on custom widgets.
6. **SEO-optimized** — per-page title, description, canonical, OG/Twitter tags and
   JSON-LD on service, article and organisation pages.

## Where things live

| Path | Purpose |
| --- | --- |
| `assets/css/theme.css` | Design tokens, light/dark palettes, component styles, RTL fixes |
| `assets/js/theme.js` | Theme + direction toggles (localStorage), sticky header, scroll reveals, counters |
| `assets/js/ui.js` | Before/after slider, gallery filter + search + pagination, lightbox, testimonial carousel, countdown |
| `assets/js/forms.js` | Booking form, upload preview, pickup ZIP check, pricing calculator, newsletter, login/register |
| `assets/vendor/bootstrap/` | Bootstrap 5.3 LTR + RTL CSS and the JS bundle |
| `assets/images/` | All photography, one folder per page/section |
| `*.html` | One file per page — edit content directly |

## JS hooks (data attributes)

`data-theme-toggle`, `data-dir-toggle`, `data-reveal`, `data-count`,
`data-ba`, `data-filter-root` / `data-filter` / `data-search` / `data-pager`,
`data-lightbox-src`, `data-quotes`, `data-countdown`,
`data-booking-form`, `data-pickup-form`, `data-calculator`, `data-subscribe`,
`data-auth-tab`, `data-password-toggle`, `data-forgot`.

Add a widget by adding the attribute to your markup — the scripts bind on
`DOMContentLoaded` and no-op when the hook is absent.

## Rebranding

1. Change the palette variables at the top of `assets/css/theme.css`.
2. Swap the Google Fonts `<link>` in each page `<head>` (or search/replace once).
3. Replace files in `assets/images/`, keeping the same names for a drop-in swap.
4. Search/replace the business name, phone, email and address strings.

## Running

Open `index.html` directly, use VS Code Live Server, or `npm run dev`
(Vite as a static server on port 8080). `npm run build` copies the site to `dist/`.
