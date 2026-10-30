# Monthly White Rock market refresh

`refresh.js` collects the live data; `build.py` rewrites the "Market snapshot" section.

```bash
node tools/market-refresh/refresh.js          # needs Playwright; ~1 minute
python3 tools/market-refresh/build.py         # optional date arg: YYYY-MM-DD
```

Outputs (repo root): `white-rock-listings-improved.html`, `white-rock-listings-code.txt`, `white-rock-listings-copy-page.html`.

- Active listings: counted from the live `/white-rock-listings` results (all pages).
- Sold data: Lofty's `/snapshot` API, set to White Rock, all sold records.
- Sales window: the 12 complete months ending two months before the run month (the sold feed lags several weeks).
- Days to sell = sold date minus list date (Lofty's `daysOnList` is days until today, so it is not used).
- `refresh.js` exits non-zero if the number of active listings it collected differs from the page header; `build.py` warns if any month in the window looks under-reported.
- Publishing is manual: paste `white-rock-listings-code.txt` into the Lofty Embed → CODE box, Update Code, Publish.
