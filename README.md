# Avondale Dirt Bike & ATV: Shop Parts demo

An isolated demonstration of how Avondale Dirt Bike & ATV could add online parts sales to its existing website. Prepared by High Ground Three for the November 20, 2026 presentation.

**This is not a production store.** The listings are samples, the prices are demo prices, and checkout is simulated. No order is sent and no card is charged.

## Run it

- **Online:** GitHub Pages serves `index.html` from the `main` branch root.
- **Offline backup:** download `index.html` and open it in any browser. It's one file with no build step and no server. Without internet, it falls back from the Google fonts to system fonts.

## What it shows

| Area | What's in the demo |
|---|---|
| Home | Keeps the repair-shop identity and the seven advertised services. Adds a **Shop Parts** nav tab, and puts a **Shop Parts** button opposite **Schedule a Service** in the top third of the page. |
| Shop | 39 sample listings in 9 categories, with search, category filter, sort, and a "Shopping for" vehicle filter. |
| Cart | Slide-out cart with quantity controls. It's kept in the browser for that viewer only. |
| Checkout | Four steps: Delivery → Vehicle → Payment → Review. |
| Confirmation | Order number, a fulfillment route diagram, and the planned "behind the scenes" workflow with the human review step. |
| Presenter panel | Bottom-left button, or press **P**. Has the run sheet, Mechanic order mode, the optional CRF250R toggle, and Reset. |

### Two fulfillment paths

| Who orders | Ships to | Checkout difference |
|---|---|---|
| **Customer** | Drop-ship from the supplier **to the customer's address** | Shipping address and simulated card or wallet payment |
| **Mechanic / shop staff** | Drop-ship from the supplier **to the workshop** | Work order #, technician, and need-by date. Billed to the shop's supplier account, with no card step. |

There's no public parts-counter or cash-register screen, and the customer never has to call to finish an order. Walk-in sales stay with the owner. POS integration is out of scope.

## Content boundaries we kept

- Vehicles come only from the business's own published testimonials: **Honda XR100** (year not specified), **1981 Honda CR250R**, and **Ice Bear trike** (model and year not specified). The testimonials are treated as the business's own content, not verified reviews.
- **2025 Honda CRF250R** is an *optional* demo vehicle. It's off by default and labeled as a separate model family from the CR250R. The client's "2025 Honda CR250" isn't presented as a real model.
- Every vehicle-specific listing shows **"Fitment check required."** Only generic consumables and multi-fit items are marked universal, each with a "confirm specs" note.
- No brand names, supplier stock claims, certifications, reviews, or performance claims. Product images are placeholders.
- The supplier isn't named on the storefront.

## Open items to verify before any production build

1. **Platform and hosting.** The client confirmed Hostinger (hostinger.com) on 2026-11-19. The site builder and plan aren't verified yet. That decides whether the store is a WooCommerce plugin, a Hostinger builder store, Shopify embedded, or a separate subdomain.
2. **Supplier: J&M ATV/UTV Supply (jmatv.com), confirmed by the client on 2026-11-19.** J&M is a dealer-only wholesale distributor on BigCommerce. Its public site doesn't mention drop-shipping, data feeds, or an API. Still to confirm: whether J&M drop-ships to customers and to the workshop, and whether it provides a catalog, price, stock, and fitment file or feed. rev-zone.pro appears to be the client's own retail storefront, not the supplier.
3. **Payment processor.** Stripe, Square, or Shopify Payments. Match the shop's POS if possible.
4. **Sales tax and shipping rules.** Arizona TPT handling, plus supplier shipping quotes or flat rates.
5. **Staff sign-in.** How mechanics authenticate for workshop orders.
6. **Customer installs.** If a customer wants the shop to install a part, does it ship to the shop instead of to them?
7. **Workshop ship-to address** and the order-notification inbox.

## Hosting note

GitHub Pages is fine for this static demo. It isn't a production e-commerce host: there's no server-side checkout, payment, or order storage. The production store needs a real commerce platform.
