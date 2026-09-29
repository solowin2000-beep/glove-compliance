# GloveSpec — cut-level compliance for industrial glove buyers

**Live site:** https://glove-compliance.pages.dev

A reference and a checker for one question: what cut level should this job specify? GloveSpec turns
a market plus an application into the level buyers normally specify, in both the EN 388 and the
ANSI/ISEA 105 scales, with the standard behind it and the specification to put on a purchase order.

## The facts this site publishes
EN 388:2016+A1:2018 reports cut from the ISO 13997 TDM test, in newtons:
A 2–5, B 5–10, C 10–15, D 15–22, E 22–30, F 30 and above.

ANSI/ISEA 105-2016 reports cut from ASTM F2992-15, in grams of force:
A1 200–500, A2 500–1000, A3 1000–1500, A4 1500–2200, A5 2200–3000, A6 3000–4000,
A7 4000–5000, A8 5000–6000, A9 6000 and above.

1 newton = 101.97 gram-force. Approximate mapping: A→A1, B→A2, C→A3, D→A4, E→A5, F→A6 and above,
because the boundaries do not line up.

No regulation sets a required level: OSHA 29 CFR 1910.138 requires hand protection chosen after a
hazard assessment, and EU Regulation 2016/425 requires type examination and CE marking. The number
comes from the risk assessment, the customer contract or the insurer.

## Pages
| Path | What it is |
| --- | --- |
| `/` | Overview, typical levels by application |
| `/cut-level-checker/` | Pick a market and a task, get the level and an enquiry sheet |
| `/cut-level-chart/` | EN 388 vs ANSI/ISEA 105, and how to read a marking like 4X42D |
| `/gloves-by-industry/` | Twelve applications with liner and coating recommendations |
| `/request-quote/` | Specification-based quotation requests |

## Tech
Astro static build, no server and no runtime API calls.

| File | Role |
| --- | --- |
| `src/site.config.mjs` | Single source of truth: domain, contact, per-page titles and descriptions |
| `src/data/glove-model.mjs` | The scales, the conversion model and the application table. All three content pages read from it |
| `src/pages/` | One file per page; the file name is the URL |

## Build
```
npm install
npm run dev     # local preview
npm run build   # static output in dist/
```

## Deploy
Upload the contents of `dist/` to Cloudflare Pages, or connect this repository with build command
`npm run build` and output directory `dist`.

## Standards referenced
EN 388:2016+A1:2018 · ANSI/ISEA 105-2016 · ASTM F2992-15 · ISO 13997 · OSHA 29 CFR 1910.138 ·
Regulation (EU) 2016/425

## Licence
Site content and design are © GloveSpec.
