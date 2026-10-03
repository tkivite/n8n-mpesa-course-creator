# Gumroad Setup Checklist : Product Structure and Launch Steps

Use this checklist when turning `n8n M-Pesa Mastery` into three live Gumroad products.

---

## 1. Product structure

Create **three separate Gumroad products**.

### Product 1

- **Name** : `n8n M-Pesa Mastery : Starter`
- **Price** : `$29`
- **Who it is for** : learners who want the videos, PDFs, and student docs

### Product 2

- **Name** : `n8n M-Pesa Mastery : Pro`
- **Price** : `$79`
- **Who it is for** : builders who want the videos plus the private consumer repo and implementation assets

### Product 3

- **Name** : `n8n M-Pesa Mastery : Agency`
- **Price** : `$199`
- **Who it is for** : freelancers, agencies, and consultants who want implementation and commercial guidance

---

## 2. Common product branding

Use this exact language everywhere.

### Title

`n8n M-Pesa Mastery`

### Subtitle

`Build Production-Ready STK Push Payment Workflows - No Backend code`

### Core promise

Build, test, and deploy production-ready M-Pesa STK Push workflows with n8n — without writing a custom backend service.

---

## 3. Starter product checklist

- [ ] Product name set to `n8n M-Pesa Mastery : Starter`
- [ ] Price set to `$29`
- [ ] Product thumbnail uploaded
- [ ] Product description pasted from `docs/gumroad-product-copy.md`
- [ ] Includes videos
- [ ] Includes PDFs
- [ ] Includes student setup docs
- [ ] Does **not** promise private repo access unless you intentionally include it

### Starter deliverables to mention

- all 10 course modules
- course handbook PDF
- Daraja cheat sheet PDF
- go-live checklist PDF
- student quickstart guide
- macOS, Windows, and Linux setup docs
- community access

---

## 4. Pro product checklist

- [ ] Product name set to `n8n M-Pesa Mastery : Pro`
- [ ] Price set to `$79`
- [ ] Product thumbnail uploaded
- [ ] Product description pasted from `docs/gumroad-product-copy.md`
- [ ] Includes everything in Starter
- [ ] Includes private consumer repo access
- [ ] Includes workflows, Postman collection, Docker starter, SQL schema, and deploy files
- [ ] Access-control automation is ready before launch

### Pro deliverables to mention

- everything in Starter
- private consumer repo access
- core workflows
- use-case templates
- Postman collection
- Docker starter setup
- SQL schema files
- deployment starter files

---

## 5. Agency product checklist

- [ ] Product name set to `n8n M-Pesa Mastery : Agency`
- [ ] Price set to `$199`
- [ ] Product thumbnail uploaded
- [ ] Product description pasted from `docs/gumroad-product-copy.md`
- [ ] Includes everything in Pro
- [ ] Includes commercial / delivery guidance
- [ ] Includes premium creator-side materials if promised
- [ ] Includes support or consult entitlement if promised

### Agency deliverables to mention

- everything in Pro
- creator-side commercial guidance
- pricing and onboarding guidance
- white-label delivery material
- proposal / packaging guidance
- premium support material
- private consult if you choose to offer it

---

## 6. Gumroad product-page settings

For each product:

- [ ] Product cover image uploaded
- [ ] Product title correct
- [ ] Short summary clear
- [ ] Full description pasted
- [ ] Refund policy visible
- [ ] Contact / support email visible
- [ ] Thank-you / post-purchase instructions clear

---

## 7. Post-purchase flow checklist

### Starter

- [ ] Buyer receives access to videos / PDFs / docs
- [ ] Buyer does not get confused about repo access

### Pro

- [ ] Buyer receives consumer repo access instructions
- [ ] Repo claim form works
- [ ] GitHub invite arrives

### Agency

- [ ] Buyer receives Pro path
- [ ] Buyer also receives agency / premium delivery instructions
- [ ] Consult scheduling path exists if promised

---

## 8. Landing-page button mapping

The creator repo landing page is already wired for three tier-specific checkout URLs.

### File to edit

- `landing/index.html`

### What to replace

Search for:

- `REPLACE_STARTER`
- `REPLACE_PRO`
- `REPLACE_AGENCY`

These appear in the `CHECKOUT_LINKS` object near the bottom of the file.

Once you paste your real checkout URLs there, all buy buttons update automatically.

---

## 9. Launch checklist before turning on sales

- [ ] All 3 products exist in Gumroad
- [ ] Titles and descriptions reviewed
- [ ] Prices reviewed
- [ ] Landing page buttons updated with live checkout links
- [ ] Sale webhook tested
- [ ] Refund webhook tested
- [ ] Consumer repo access flow tested
- [ ] Starter delivery flow tested
- [ ] Support email checked

---

## 10. After publishing

Do one real purchase test for each path you care about:

- [ ] Starter purchase test
- [ ] Pro purchase test
- [ ] Agency purchase test (or at minimum inspect the product page manually)

For Pro and Agency, confirm:

- [ ] receipt arrives
- [ ] claim link works
- [ ] GitHub invite arrives
- [ ] consumer repo can be cloned

