# Landing Page

Single-file static landing page. Open `index.html` in a browser.

## Deploy anywhere, free

### Netlify / Vercel
Drag the `landing/` folder onto netlify.com/drop — live in 30 seconds. Same with vercel.com.

### GitHub Pages
Settings → Pages → Branch: `main`, Folder: `/landing`. Live at `https://<username>.github.io/n8n-mpesa-course-creator/`.

### Cloudflare Pages
Create a project pointing at this repo, set build output directory to `landing`. Live on your Cloudflare domain.

### Your own domain
Any static host works. `index.html` is self-contained — no build step, no bundler, no dependencies.

## Customising

- **Colors**: edit the CSS variables at the top of `<style>` in `index.html`
- **Pricing**: find the `.tier` divs under `<section id="pricing">`
- **Copy**: all text lives inline (deliberate: easy to grep & edit)
- **Payment links**: replace `href="#"` on the "Buy" buttons with your Gumroad / Lemon Squeezy / Paystack URL
- **Analytics**: paste your Plausible / GA / PostHog snippet into `<head>`

## Why no framework?

The whole page is ~15 KB. It loads instantly on 3G. There is nothing to build, bundle, or hydrate. If you later want React / Astro / Next, you have a clean baseline to port from.

