# QR Code Generator

A free, privacy-respecting QR code generator for the LHENA Volunteer Network (LVN) and Lowry Hill East Neighborhood Association.

**Use it:** https://thewedgempls.github.io/qr-generator/

## Why this exists

Many "free" QR code sites don't encode your link directly and  point the code at their own server, which then forwards people to your page. That lets them count and log every scan, and some stop working if you don't pay. This tool encodes your link directly into the code.

## What it does

- Makes QR codes for links or text
- Downloads PNG (for documents and screens) or SVG (for print at any size)
- Lets you choose colors and how much damage the code can survive

## Privacy

- Runs entirely in your browser and nothing you type is uploaded.
- The page makes no network requests after it loads (enforced by a Content-Security-Policy).
- No accounts, ads, cookies, or analytics.
- A code can't control what happens after the scan. If the page you link to uses analytics, it may still track visitors.
- GitHub keeps standard server logs of visits to this page. They don't record scans of your codes.

## Tips for printing

- Scan the code with your phone before printing.
- Keep dark codes on a light background.
- Print at least 2 cm (about ¾ in) wide and keep the white border.
- Avoid link shorteners such as bit.ly. They log every click.

## For developers

Static site: `index.html`, `styles.css`, `app.js`, and `qrcode.js`. No build step. Serve the folder with any static host.

`qrcode.js` is [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 by Kazuhiko Arase, MIT license. "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
