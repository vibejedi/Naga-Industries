# Pre-orders into a Google Sheet

The order forms on `lakan-ii.html`, `sipag-i.html` and `diwa.html` send each pre-order and reservation to
`/api/preorder`. That function records an order only when it has somewhere to send it. With no destination set it
answers 503, and the visitor sees "Online pre-orders are not open yet" with a link to email us.

This sets up the simplest destination: one Google Sheet that gets a row per person, plus a tally.

## What each row holds

Time, reference, type (`card-request` for a laptop pre-order, `reserve` for DIWA), product, quantity, country,
name, email, how they heard about Naga, AI assistant they arrived from, currency and order total.

## Setup (about five minutes)

1. Create a Google Sheet. Open **Extensions → Apps Script**.
2. Delete what is there, paste the script below, and change `KEY` to a long random string of your own.
3. **Deploy → New deployment → Web app.** Execute as: **Me**. Who has access: **Anyone**. Deploy, approve the
   permission prompt, and copy the web app URL. It ends in `/exec`.
4. In Vercel: **Project → Settings → Environment Variables.** Add `PREORDER_WEBHOOK_URL` with the value
   `<web app URL>?key=<your KEY>` for Production. Save.
5. **Redeploy** the project (Deployments → the latest one → Redeploy) so the function picks the variable up.
6. Test: open a product page on naga.industries, fill in the form and submit. You should see "You are on the
   pre-order list" and a new row in the sheet within a few seconds. Delete your test row afterwards.

Keep the URL and key out of the repo and out of `store.json`; anyone who has them can add rows.

## The script

```js
// Naga pre-orders: one row per order, and a Tally tab that counts them.
const KEY = 'change-me-to-a-long-random-string';
const COLS = ['Time', 'Ref', 'Type', 'Product', 'Qty', 'Country', 'Name', 'Email', 'Heard about Naga', 'AI source', 'Currency', 'Total'];

function doPost(e) {
  if (!e || e.parameter.key !== KEY) return out({ ok: false, error: 'forbidden' });
  const r = JSON.parse(e.postData.contents);
  const q = r.quote || {};
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let orders = book.getSheetByName('Orders');
  if (!orders) {
    orders = book.insertSheet('Orders');
    orders.appendRow(COLS);
    orders.setFrozenRows(1);
    const tally = book.insertSheet('Tally');
    tally.getRange('A1').setValue('People on the list');
    tally.getRange('B1').setFormula('=COUNTA(Orders!B2:B)');
    tally.getRange('A3').setFormula('=QUERY(Orders!A:L,"select D, count(B), sum(E) where B is not null group by D label D \'Product\', count(B) \'People\', sum(E) \'Units\'",1)');
    tally.getRange('E3').setFormula('=QUERY(Orders!A:L,"select F, count(B) where B is not null group by F order by count(B) desc label F \'Country\', count(B) \'People\'",1)');
  }
  orders.appendRow([r.createdAt, r.ref, r.type, r.product, r.qty, r.country, r.name, r.email, r.heard || '', r.ai || '', q.currency || '', q.priced ? q.total : '']);
  return out({ ok: true });
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
```

## Notes

- The **Tally** tab shows the number of people on the list, a count by product and a count by country.
- One person can submit twice; count unique emails with `=COUNTUNIQUE(Orders!H2:H)`.
- The laptop forms take no payment while card checkout and crypto are not connected. They say "No payment now"
  and hide the payment choices; `naga-store.js` does this by itself when the Shopify and Privy settings in
  `store.json` are empty.
- Names and emails are personal data. Keep the sheet private, and use it only to contact people about their order.
