# Session Record: Avondale Dirt Bike & ATV, Shop Parts Demo Build
**Date:** Thursday, November 19, 2026, 9:42 am to 11:15 pm (Arizona time)
**Prepared for:** Charlie Ellis, High Ground Three
**Client:** Dennis Doherty, Avondale Dirt Bike & ATV (doughertyent@gmail.com · 480.270.4465)
**Purpose of session:** Build a reliable demonstration of online parts sales for Dennis's existing website, ahead of the Friday, November 20 pitch. The engagement being pitched covers website management and social media services.
**Suggested conversation title:** 2026-11-19 Avondale Shop Parts Demo Build
**Status at close:** Paused by Charlie ("let's take a break here, wait for that meeting"). The demo is built, tested and pushed to GitHub. Three setup steps remain on Charlie's side, and one data load is waiting on Chrome.

---

## 1. Executive summary

In one long session we went from an empty GitHub repo to a working demo that:

1. **Mirrors Dennis's live homepage** (avondaledirtbikeatv.com), with his real logo, shop photos, menu, service-request form, wording, testimonials, FAQs, service cards, hourly labor rates and footer. The demo adds a **Shop Parts** tab in place of his broken "Part & Accessories" link, plus a prominent Shop Parts panel at the top of the page.
2. **Sells real J&M ATV/UTV Supply parts.** The catalog has 42 live listings with J&M's own product photos, brand, part number, J&M retail price as listed on November 19, and J&M's fitment text. Customers can search, filter by category and make, and sort.
3. **Runs a full purchase.** Cart, then four checkout steps (Delivery → Vehicle → Payment → Review), then confirmation. The customer chooses **Ship to my address** or **Ship to the shop** (pickup or have it installed). A separate **Mechanic order** mode ships to the workshop against a work order number.
4. **Sends real email.** This works once Charlie deploys the Apps Script.
   - The customer gets a receipt.
   - **Dennis gets a printable order ticket for every order, wherever it ships,** with a TO DO checklist.
   - Returns and part requests also produce a customer email and a Dennis ticket.
5. **Includes a chat assistant** that:
   - finds parts from plain or slang wording;
   - knows dirt bikes from quads/UTVs and three-wheelers;
   - handles returns, with return numbers, step-by-step instructions and a follow-up email;
   - takes part requests for anything not in the catalog;
   - logs every search, plus a "Not what I need" correction, as training data.
6. **Has a presenter panel** (bottom-left button, or the P key) with a 5-minute run sheet, Mechanic order mode, the chat search log and a Reset button.
7. **Has an offline backup:** one HTML file with every image built in, so the demo runs without Wi-Fi.

---

## 2. Decisions made (with reasoning)

| # | Decision | Reasoning | Who |
|---|---|---|---|
| D1 | Build a single static web page, hosted on GitHub Pages, with an offline backup copy | A reliable 5-minute demo beats an unfinished app. No server means nothing breaks on stage. | Claude, accepted by Charlie ("let's build") |
| D2 | Two fulfillment paths: a customer order drop-ships to the customer; a mechanic order drop-ships to the workshop | Charlie's stated business rule | Charlie |
| D3 | Customers can also choose "Ship to the shop" (pickup, or the shop installs) | Charlie noticed the demo didn't let customers change the delivery location | Charlie |
| D4 | **Dennis gets an email ticket for every order, whatever the delivery path** | Dennis currently handles all communication through his inbox, so the tickets act as his paperwork until a shop workflow exists | Charlie |
| D5 | Customer receipts, return confirmations and request copies send **automatically** | A real end-to-end experience for Dennis's mock purchase. This is a deliberate exception to Charlie's drafts-only email rule, approved in the question card. | Charlie |
| D6 | The return policy is a **sample**, clearly labeled "Sample policy. The shop sets the final terms." | We don't know Dennis's real terms, so none were invented | Charlie (question card) |
| D7 | The homepage mirrors his live site, captured through Charlie's Chrome | The pitch lands better when the new features appear inside his own site | Charlie asked "how close is it?" and gave Chrome access |
| D8 | Template placeholder testimonials (Cody Fisher, Kristin Watson, Albert Flores, Jackson Hero) and the "Our Brands" logo strip are left out | The names are stock template text, and the brand logos belong to manufacturers. It's also a talking point for Dennis. | Claude |
| D9 | The catalog uses **real J&M listings and J&M's photos**, not placeholders | Charlie: "Don't use placeholders, use images provided by the parts store" | Charlie |
| D10 | The vehicle filter became a **Make** filter. The testimonial bikes and the CRF250R toggle were removed. | J&M lists no parts for the XR100, CR250R or Ice Bear. Offering those would imply a fit that doesn't exist. | Claude |
| D11 | Every vehicle-specific part shows "Fitment check required"; prices are labeled "J&M retail" | Honest about fitment, and Dennis's real price comes from his own markup | Claude |
| D12 | The chat assistant is a second way to buy, alongside the store | Charlie's idea: customers type what they're looking for | Charlie |
| D13 | The chat gets vehicle-type logic, rider slang, unknown-make handling, follow-up context, and a "Not what I need" correction step that feeds a training log | Charlie's test ("KTM 250 2023") returned a ball joint, a part motorcycles don't use. He expects customers to use more slang than proper terms. | Charlie raised the problem; Claude fixed it |
| D14 | **Long-term ownership:** after Dennis signs off, buy dedicated AI and platform accounts in Dennis's name so he owns the build regardless of the relationship | Trust and durability for the client | Charlie |
| D15 | Load at least 500 J&M items while waiting for the meeting | A bigger, more convincing catalog for the demo | Charlie |

---

## 3. What changed from the prior state

**Before this session**
- The Nov 10 session left an earlier demo modeled on rev-zone.pro, a discovery memo, and an empty repo, `highgroundthree-art/Avondal-demo-one`.
- The supplier was assumed to be rev-zone.pro.
- There were no real product photos or prices, and no email capability.

**After this session**
- The repo holds a complete demo (8+ commits).
- **The supplier is confirmed by Dennis as J&M ATV/UTV Supply (jmatv.com).** rev-zone.pro appears to be Dennis's own WooCommerce storefront (same phone number, an Avondale address, and its service bookings link to his site). It is not the supplier.
- Dennis's hosting is confirmed as Hostinger. Owner email confirmed. Phone confirmed from his logo.
- **J&M's full catalog is 17,742 products** (from J&M's sitemap). That matches the "~16,000" figure in the Nov 10 notes.
- The email system is written (`apps-script/Code.gs`) but not yet deployed.

---

## 4. Artifacts produced

| Artifact | Location | Notes |
|---|---|---|
| `index.html` | Repo root | The demo |
| `images/site/*` | Repo | Dennis's logo, shop photo, repair photo, 6 service-card photos |
| `images/parts/jm*.jpg` | Repo | 42 J&M product photos, each checked against its product |
| `apps-script/Code.gs` | Repo, also sent in chat | The email sender: customer receipts, return and request confirmations, and Dennis's tickets with TO DO checklists. Rate limits: 40 a day total, 8 a day per address. Blocks example.com and test.com addresses. Includes a `testSendToMe` function. |
| `dist/avondale-demo-offline.html` | Repo, also sent in chat (latest version) | One file with every image built in |
| `tools/build_offline.py` | Repo | Rebuilds the offline file after any change |
| `tools/harvest_jm.js` | Repo | The staged catalog pull |
| `tools/chat_regression_queries.py` | Repo | 26 slang test searches, rerun after each chat change |
| `README.md` | Repo | Run instructions, feature table, content boundaries, email setup, open items |
| Project doc: "Shop Parts demo build — 2026-11-19" | Claude Project | Kept current with decisions and open items |
| This Session Record | Repo, sent in chat, and saved to the Project | |

**Email ticket tags** (for Gmail filters):
- `[ADB-PARTS-ORDER]`: customer orders. "SHIP TO SHOP" is added when the customer picked that option, and "FITMENT CHECK" when any item needs it.
- `[ADB-SHOP-ORDER]`: mechanic orders.
- `[ADB-RETURN-REQ]`: return requests.
- `[ADB-PART-REQUEST]`: part requests.

---

## 5. Testing completed

All tests ran in a headless browser at desktop (1300–1440 px) and phone (360–390 px) widths:
- **Purchases:** customer ship-to-home, customer ship-to-shop with install, and mechanic order. Each ended at the confirmation page, with the email calls going to a stand-in server, and the right email types and delivery modes sent.
- **Returns:** the full return flow (order lookup, part selection, reason, condition, return number, email), plus the damaged-item path with the photo-skip option.
- **Chat:** 26 slang searches, the KTM ball-joint case, follow-up context, the "Not what I need" correction, and part requests for items not in the catalog.
- **Layout:** no sideways scrolling on phones, the menu opens on mobile, and every product photo matches its product.
- **Offline file:** every image loads with no internet.
- **Email script:** passed a JavaScript syntax check, and a sample ticket was rendered and reviewed.

**Not yet tested live:** real email delivery (the Apps Script isn't deployed yet) and the GitHub Pages URL (Pages isn't turned on yet).

---

## 6. Open items

### Charlie's to-do before the meeting
1. **Turn on GitHub Pages.** In the repo, go to Settings → Pages → Deploy from a branch → `main` / root → Save. Expected URL: `https://highgroundthree-art.github.io/avondal-demo-one/`. Claude can't reach GitHub's settings page from its tools or through Chrome.
2. **Deploy the email script** from the new Avondale Gmail account:
   1. Go to script.google.com → New project and paste in the latest `Code.gs`.
   2. Run `testSendToMe` and approve the permissions.
   3. Deploy → New deployment → Web app. Set "Execute as: Me" and "Who has access: Anyone".
   4. Send Claude the web app URL. Claude pastes it into `CONFIG.EMAIL_ENDPOINT` and pushes.
3. **Confirm the meeting time.** A 9 am time was proposed by text; nothing is on the OEG calendar.
4. **Bring the offline file** on the device you'll present from.

### Waiting on Chrome
5. **Load the 500+ parts.** The pull already ran and captured **687 J&M items** (photos, retail prices, part numbers, fitment text) in a J&M tab in Charlie's Chrome. The connection dropped while copying the data over.
   - To finish: open Chrome on the Chromebook with Claude in Chrome signed in, and say "finish the 500". If the tab was closed, the pull reruns in about 2 minutes.
   - The plan for getting the data over: compress it and pack it into images saved straight to disk, because sending it as text would cost too much.
   - After loading: tag each part by vehicle type, test the chat against the larger catalog, rebuild the offline file, and push.

### Questions for Dennis tomorrow
6. Does he have a J&M **dealer account**? Will J&M **drop-ship** to customers and to his shop? Does J&M offer a **data feed** (CSV or API) with prices, stock and fitment? This decides whether the full 17,742-item catalog can go live.
7. His **markup rules**: one percentage across the board, or by category or brand? He wants to adjust all prices, for example "3% off everything."
8. **Platform:** stay on WooCommerce (rev-zone.pro) or move to Shopify? Running two stores should be a deliberate choice.
9. Which **Hostinger** plan and builder runs avondaledirtbikeatv.com?
10. **Payment processor** (Stripe, Square or Shopify Payments). Match his shop's POS if possible.
11. His **return policy** terms, to replace the sample.
12. The **workshop ship-to address**, and how staff should sign in.
13. A few searches typed the way his customers actually talk, as the first round of chat training.
14. Placeholder testimonials on his live site (Cody Fisher, Kristin Watson, Albert Flores, Jackson Hero) should come down.

### Later phases
15. Full catalog: with a J&M feed, about a day to import, then 1–2 weeks for markup, fitment search, cleanup and testing.
16. Production chat assistant: Claude-powered, grounded in J&M fitment data, keeping the same feedback loop.
17. Price automation: requests come in through a dedicated Gmail, Claude builds a preview, Charlie approves, and a script applies the changes through the API. Safeguards: one source of truth, compare-at sales pricing, a margin floor, a change log with rollback, and sender verification.
18. Accounts in Dennis's name after sign-off (D14).
19. Marketing and social media (phase 2): shop photos, real reviews, a scheduler.

---

## 7. Conflicts with existing artifacts

| Conflict | Resolution |
|---|---|
| Nov 10 memo: "Supply house = rev-zone.pro" | **Superseded.** The supplier is J&M (jmatv.com). rev-zone is Dennis's own storefront. |
| Nov 10 demo concept: email-to-*Drafts* with the human review step | Kept for **supplier orders** (Dennis still places J&M orders himself). Customer-facing emails now send automatically (D5). |
| Charlie's standing drafts-only email rule | Exception for this demo's Apps Script only (D5). Claude's own Gmail connector use still follows the drafts-only rule. |
| The original brief called for the testimonial vehicles and an optional CRF250R | Replaced by the Make filter (D10). The testimonial vehicles remain on the homepage as Dennis's own published testimonials. |
| Earlier demo builds used placeholder product icons | Replaced by J&M photos (D9). |
| The project memory file for "buddy's Shopify parts store" may refer to a different client | Not resolved this session. Check whether it's the same engagement. |

---

## 8. Separate request at close (not Avondale)

Charlie wants **transcription set up for a board meeting on about December 17**. He described it as a Phoenix military/veteran advisory committee in the nonprofit space, with a lot of background in his email.
- **Searched:** OEG Gmail (charlie@operationenduringgratitude.org) for veteran/military advisory committee meetings and December 17. **Nothing matched.** It only found American Legion Post 145 newsletters and the OEG insurance thread.
- **Searched:** the OEG calendar for December 15–18. **No events.**
- **Likely cause:** the emails are in a different account (personal Gmail or EVIT), or use other wording. Next session needs the committee's exact name or the sender.
- **Transcription options to decide next session:**
  - If the meeting is online: Google Meet's built-in transcript, or Zoom's.
  - If in person: record on the Samsung Note 20 and transcribe afterward.
  - Either way: a Claude summary into minutes format. Confirm recording consent with the committee chair first.

---

## 9. What the next session must load

1. This Session Record.
2. The Project doc "Shop Parts demo build — 2026-11-19" and the Nov 10 Discovery memo.
3. The repo `highgroundthree-art/Avondal-demo-one`, latest commit on `main`. Read `README.md`, the `CONFIG` block at the top of the `index.html` script, and `apps-script/Code.gs`.
4. Notes from the Dennis meeting: answers to items 6–14, his reaction, and whether he signed off.
5. If continuing the catalog load: Chrome connected, plus the J&M tab still open (or rerun `tools/harvest_jm.js` logic).
6. For the board-meeting transcription: the committee's exact name, the meeting format (in person or online), and which email account has the threads.
