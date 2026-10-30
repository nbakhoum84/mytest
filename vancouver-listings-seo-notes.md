# /vancouver-listings: CMS SEO fields and change notes

## Set these in the CMS (Edit Page)

| Field | Value |
|---|---|
| Meta Title | `Homes for Sale in Vancouver, BC | Nader Bakhoum – eXp` |
| Meta Description | `Browse Vancouver, BC condos, townhomes and houses for sale, from Yaletown to Kitsilano. Local market stats and insight from Nader Bakhoum, P.Eng.` |
| SNS Cover Photo | A real image, at least 1200×630 |
| Page Script | Contents of `vancouver-market-loader.txt` |

## How the market numbers are defined

Numbers cover the City of Vancouver: active = residential homes for sale (condos, townhomes, single-family and multi-family; commercial, vacant land and rentals left out), 4,965 on Oct 30, 2026. The page header shows 4,456, about 10% lower. The filter behind that header could not be reproduced, and the page's first 24 listings were all residential for sale, so the page's own filter is probably narrower in a way I could not identify. The source note on the page says the count in the search can differ. Sales cannot be reconciled against Lofty's monthly statistics. Monthly refresh uses `tools/market-refresh/refresh_api.py vancouver` (no browser needed; its header check allows 15%).

## Claims removed or softened (could not be verified)

- Stanley Park "one of the largest urban parks in North America" and "roughly 10-kilometre seawall" became "a large urban park" with "a seawall path".
- "A transit combination none of its suburbs can match" and "more rapid transit options than any other city in the region" removed.
- Neighbourhood superlatives removed: Kitsilano "most walkable and consistently in-demand", West End "one of the most densely populated in Canada", Mount Pleasant "trendy".
- "UBC's Point Grey campus ... anchor" corrected: UBC Point Grey sits beside the city (outside its boundary), SFU's Harbour Centre campus is downtown.
- Empty Homes Tax: the "3% of assessed value" rate, the claim it is layered on the provincial Speculation and Vacancy Tax, and "unique to the city" removed. The page now points to the City for the current rate.
- "Vancouver School Board ... one of the largest in the province" removed.
- "Knob-and-tube wiring and outdated plumbing still more common than people expect" removed from Nader's Take.
- "Dozens of distinct neighbourhoods" became "many".

## Please verify

- BC property transfer tax thresholds (35,000 first-time buyer figure) against current BC government figures.
