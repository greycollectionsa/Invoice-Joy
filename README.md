# Invoice Joy

A free quote and invoice builder for South African small business. It runs on
your own computer, needs no signup, and keeps your prices and client list on
your machine.

Built by [IDJOY (Pty) Ltd](https://idjoy.co.za/).

## What is in here

| File | What it is |
|---|---|
| `index.html` | The public landing page for the tool. Open it directly in a browser. |
| `Invoice.html` | The app itself: the quote and invoice document you type into. |
| `script.js` | All app logic: rows, totals, packages, client saving, PDF export. |
| `styles.css` | Styles for the document and the app controls. |
| `easings.js` | Easing curve runtime used for the page and app motion. |
| `server.py` | A tiny standard-library server that also reads and writes the JSON files. |
| `thank-you-slip.html` / `thank-you-slip.js` | A sign-off slip generated from the current quote. |
| `banner.svg` | The letterhead at the top of the document. Replace it with your own. |
| `clients.json` | Saved clients. Ships empty. |
| `number_tracker.json` | Last used quote and invoice numbers, so none get reused. |

## Running it

You need Python 3. Macs and most Linux machines already have it. On Windows,
install it from python.org and tick **Add Python to PATH**.

```bash
git clone https://github.com/greycollectionsa/Invoice-Joy.git
cd Invoice-Joy
python3 server.py
```

Then open **http://localhost:8000/Invoice.html**

There is nothing to `pip install`. The server uses only modules that ship with
Python. Client saving and invoice numbering need the server running, because
they write to the JSON files. If you open `Invoice.html` straight off disk it
still works, but it falls back to browser storage instead.

## What it does

- Pick line items from a price list you control, with cost and duration attached
- Load a whole package of services in one click
- Quantity, markup, subtotal, total and the 50% deposit recalculate as you type
- Turn an accepted quote into a numbered invoice without retyping it
- Save a client once and pick them from a dropdown next time
- Export a clean A4 PDF with the controls hidden
- South African terms and conditions already written, and editable in place

## What it does not do

- No bank feeds, no VAT returns, no ageing reports. It builds documents.
- One person, one computer. There is no team sync.
- No mobile app. It runs in a desktop browser.

If you need those things, a paid cloud package is a better fit.

## Banking details, please read

The banking block in `Invoice.html` **ships empty on purpose**. Fill it in on
the page before you export a PDF.

Do not commit real account numbers to this repository or to any public fork.
An earlier version of this file had live bank details hardcoded in it, which is
exactly the mistake to avoid: anything committed to git stays in the history
even after you delete it from the current version.

## Changing it to suit you

- **Prices and services:** the `services` array near the top of `script.js`
- **Packages:** the `packages` object just below it. Package item names must
  match the `services` names exactly, or the lookup will miss.
- **Package button labels:** the three buttons in `Invoice.html`. If you change
  a price, update the label to match the new sum.
- **Terms:** edit them directly on the page, or in `Invoice.html` to make it permanent
- **Letterhead:** replace `banner.svg`
- **Currency format:** `zarFmt` in `script.js`. It is set to `R3,309.50`, the
  convention already used on IDJOY documents.

## Licence

MIT.

Motion uses easing curves from [easings.net](https://easings.net) by Andrey
Sitnik and Ivan Solovev (MIT), based on Robert Penner's easing equations.
