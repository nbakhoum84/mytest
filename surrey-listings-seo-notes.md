# /surrey-listings: CMS SEO fields and change notes

## Set these in the CMS (Edit Page)

| Field | Value |
|---|---|
| Meta Title | `Homes for Sale in Surrey, BC | Nader Bakhoum – eXp` |
| Meta Description | `Browse Surrey, BC homes, condos and townhomes for sale, from City Centre to Cloverdale. Local market stats and insight from Nader Bakhoum, P.Eng.` |
| SNS Cover Photo | A real image, at least 1200×630 |
| Page Script | Contents of `surrey-market-loader.txt` |

## How the market numbers are defined

The page leaves South Surrey out, so the numbers use Surrey listings and sales outside postal prefixes V3Z, V4A and V4P, with leases and rentals dropped. This gave 3,922 active listings on Oct 30, 2026 against 3,988 in the page header (1.6% lower). The exact filter behind the header could not be reproduced, so the "other listings" figure in the source note is approximate; the figures for condos, townhomes and single-family homes are unaffected. The source note on the page states the definition. Sales cannot be reconciled against Lofty's monthly statistics for this area. Monthly refresh uses `tools/market-refresh/refresh_api.py surrey` (no browser needed).

## Claims removed or softened (could not be verified)

- "Second-largest city in BC" kept as "second-most populous"; "biggest municipality by land area" and "largest city in Metro Vancouver by land area" removed.
- "Some projections have it overtaking Vancouver" removed.
- "Tallest building in the city, 3 Civic Plaza" removed (page, neighbourhood and highlight card).
- "Kwantlen Polytechnic University's main campus" became "campuses in Surrey".
- "One of Canada's largest rodeos" became "an annual rodeo".
- "Surrey's most rural-feeling town centre" and "one of Surrey's largest and most diverse communities" softened.
- "Value impact along Fraser Highway is already showing up" removed from Nader's Take.
- Transit and drive times (30 to 40 minutes by Expo Line, 35 to 50 by car) replaced with a pointer to TransLink.
- Transfer-tax answer no longer names specific condo and estate-lot areas.
- Added Highway 99 to the highway list; heading "Six Town Centres" became "Town Centres" (this page excludes South Surrey).

## Please verify

- BC property transfer tax thresholds (35,000 first-time buyer figure) against current BC government figures.
