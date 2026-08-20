# Heritage & Grain — HTML5 + Bootstrap 5 Template

A pure **HTML + CSS + vanilla JavaScript** website template for a furniture repair &
restoration business. No React, no JSX, no router library, no build step.

## Run it

Any of these works:

1. **Open directly** — double-click `index.html` (all paths are relative).
2. **VS Code** — install the *Live Server* extension, right-click `index.html` → “Open with Live Server”.
3. **Node** — `npm install && npm run dev` (Vite is used only as a static dev server on port 8080).

`npm run build` simply copies the site into `dist/` — the files are already production-ready.

## Structure

```
index.html                 Home 1
home-2.html                Home 2 (conservation studio niche)
about.html services.html projects.html turnaround-times.html
pricing-guide.html blog.html contact.html account.html
coming-soon.html 404.html
service-*.html             10 service detail pages
post-*.html                9 blog article pages
assets/
  css/theme.css            design tokens, dark mode, RTL rules
  js/theme.js              theme + LTR/RTL switch, sticky header, reveals, counters
  js/ui.js                 before/after slider, gallery filters, lightbox, carousel, countdown
  js/forms.js              booking form, pickup ZIP check, pricing calculator, auth UI
  vendor/bootstrap/        Bootstrap 5.3 (LTR + RTL builds, JS bundle)
  images/                  all photography, grouped per page
sitemap.xml  robots.txt
```

## Features

- Dark / light mode and LTR / RTL switching (persisted in `localStorage`; the RTL
  Bootstrap stylesheet is swapped in automatically).
- Mobile-first responsive layout with Bootstrap 5 grid, offcanvas nav and dropdowns.
- Working before/after comparison slider, gallery filters + lightbox, testimonial
  carousel, countdown, pricing calculator, pickup ZIP availability check, booking
  form with image preview, and login/register UI with validation — all vanilla JS.
- Semantic HTML5, per-page meta/OG/Twitter tags, canonical URLs and JSON-LD.

See `DEVELOPERS.md` for theming and rebranding notes.
