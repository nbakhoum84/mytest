# Monthly White Rock market refresh (automatic publishing)

The page's Edit Page → **Page Script** field contains a small loader (`white-rock-market-loader.txt`; the Lofty Embed box strips `<script>` tags, so it cannot go there). It reads `tools/market-refresh/data/market.json` from this public repo
(`raw.githubusercontent.com`, branch `claude/practical-wozniak-s89tdk`) and fills in every number marked `data-wr`.
The numbers written in the HTML are the fallback if JavaScript or the feed is unavailable.

**One-time setup:** (1) paste `white-rock-listings-code.txt` into the Lofty Embed → CODE box (Update Code); (2) paste `white-rock-market-loader.txt` (JavaScript only, no `<script>` tags) into Edit Page → Page Script; (3) Save and Publish.
After that, pushing a new `market.json` updates the live page (within about 5 minutes, the GitHub cache time). No Lofty login, no re-paste.

```bash
node tools/market-refresh/refresh.js      # collect data (~1 min, needs Playwright)
python3 tools/market-refresh/build.py     # write market.json + rebuild the code files; optional date arg, --force
```

- Active listings: counted from the live `/white-rock-listings` results (all pages). Sold data: Lofty `/snapshot` API set to White Rock.
- Sales window: the 12 complete months ending two months before the run month (the sold feed lags several weeks).
- Days to sell = sold date minus list date, both as Pacific-time calendar dates (Lofty's `daysOnList` is days until today, so it is not used).
- Sales are bucketed by month in Pacific time, exactly as Lofty does. Checked 2026-10-30: monthly counts and median sold prices for Oct 2025 to Aug 2026 match Lofty's `soldPriceStat` feed with 0 differences, and days to sell matches Lofty's own average (110.3 vs 110.0 over 11 sales).
- `refresh.js` exits 2 if the collected active count differs from the page header, 3 if the Lofty request cannot be found.
- `build.py` safety gate: if any headline figure moves more than 25%, it writes `data/market.pending.json`, changes nothing else, and exits 4. Review, then re-run with `--force`.
- The loader only writes allow-listed characters (letters, digits, `$ , . -` and spaces, max 40) with `textContent`, so a bad feed cannot inject markup.
- If the branch is renamed or deleted, update `FEED_URL` in `build.py` and re-paste the code once.
- Scheduled: 8:00 AM Pacific on the 5th of each month. The static fallback numbers can be refreshed occasionally by re-pasting the code.
