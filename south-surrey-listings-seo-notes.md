# /south-surrey-listings: CMS SEO fields and change notes

## Set these in the CMS (Edit Page)

| Field | Value |
|---|---|
| Meta Title | `Homes for Sale in South Surrey, BC | Nader Bakhoum – eXp` |
| Meta Description | `Browse South Surrey, BC homes, townhomes and condos for sale, from Crescent Beach to Morgan Creek. Local market stats from Nader Bakhoum, P.Eng.` |
| SNS Cover Photo | A real image, at least 1200×630 |
| Page Script | Contents of `south-surrey-market-loader.txt` |

## How the market numbers are defined

Lofty has no "South Surrey" city, so the numbers use Surrey listings and sales with postal codes starting V3Z, V4A or V4P, with Commercial and Vacant Land left out of the active count. That reproduces the page's own listing count exactly (958 on Oct 30, 2026). The page states this definition in its source note. Because it is not a Lofty city, the sales cannot be reconciled against Lofty's monthly statistics the way the other pages are. Monthly refresh uses `tools/market-refresh/refresh_api.py southsurrey` (no browser needed).

## Claims removed or softened (could not be verified)

- "Surrey's most upscale town centre" and "one of South Surrey's most exclusive pockets" removed.
- "A very different feel from Whalley or Guildford" became "a lower-density feel than many parts of Surrey".
- Grandview Heights "close to Highway 99 and South Surrey's shops" and Sunnyside Park "near Softball City and South Surrey Athletic Park" removed.
- Elgin/Chantrell "waterfront and near-waterfront estates" became "larger lots and estate-style homes".
- Investing answer ("held its value well ... limited new supply compared to North Surrey") removed.
- Transfer-tax answer no longer claims fewer South Surrey buyers qualify for the first-time exemption than North Surrey.
- Drive time "40 to 50 minutes" became "roughly 40 to 60 minutes, depending on neighbourhood and traffic".
- "A lot of Crescent Beach and Ocean Park was built well before current building codes" became "older streets near the water".

## Please verify

- BC property transfer tax thresholds (35,000 first-time buyer figure) against current BC government figures.
