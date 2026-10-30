# /abbotsford-listings: CMS SEO fields and change notes

## Set these in the Edit Page dialog (not in the code)

| Field | Value |
|---|---|
| Meta Title (57 chars) | `Houses & Homes for Sale in Abbotsford, BC | Nader Bakhoum` |
| Meta Description (155 chars) | `Browse Abbotsford, BC houses, condos and townhomes for sale in West Abbotsford, Mill Lake, Clearbrook and Sumas Mountain. Local insight from Nader Bakhoum.` |
| SNS Cover Photo | A real Abbotsford image, 1200x630 (Mount Baker, Mill Lake, or Sumas Mountain) |
| Meta Keywords | Ignore (Google does not use it) |

Why this title: keyword research showed "houses for sale abbotsford" at about 14,800 searches a month (Canada), so the title covers both "houses" and "homes". Your old title was about 83 characters and would have truncated.

## What changed from the original code
1. Removed `<title>`, `<meta>`, canonical, Open Graph and Twitter tags. The platform already outputs them; duplicates conflict. Also removed `twitter:site @NaderRealty` (unverified handle).
2. All CSS scoped under `.wr` with `wr-` class names, so it cannot restyle the platform's header, listing cards or footer. About 150 lines of unused CSS removed (`.stat-strip`, `.mix-bar`, `.listing-row`, etc.).
3. FAQ rebuilt with native `<details>/<summary>`. The old `max-height: 260px` could clip the long tax answer on phones; the buttons had no `aria-expanded`.
4. Schema fixes:
   - The FAQ schema text now matches the visible FAQ text exactly (they differed in 3 answers: tax, Metro Vancouver, school/university). Mismatches can disqualify FAQ markup.
   - BreadcrumbList no longer has a "Residential" step pointing at the same page plus an unlinked third item.
   - RealEstateAgent now uses `@id https://home-nader.com/#agent`, the homepage as `url`, and one shared entity with the other pages.
5. Broken links replaced: `/mortgage-land-transfer-tax-calculator` and `/mortgage-payment-calculator` load an empty page; now `/cash-to-close` and `/mortgage-calculators`. Added links to `/langley-listings`, `/abbotsford-presales`, `/abbotsford-sold-listings`.
6. Removed duplicate header and footer blocks (the platform already renders them).
7. Accessibility: semantic breadcrumb and lists, `aria-labelledby` sections, decorative emoji hidden from screen readers, footer text contrast raised from about 3.3:1 to 5.2:1, all text at least 12px, fonts trimmed and `preconnect` fixed.

## Content claims I changed (please verify)
- Removed "roughly 90 minutes by transit" to downtown Vancouver. It is probably wrong (there is no direct rail service from Abbotsford). Now "about 60 to 75 minutes by car, depending on traffic" everywhere (the page said both "60" and "60 to 75").
- "Some of the most affordable real estate in the Lower Mainland" became "typically more affordable than Metro Vancouver".
- "Top Schools / excellent schools" became "Schools" (subjective claim you can't back up).
- "one of North America's longest-running airshows" became "the long-running Abbotsford International Airshow".
- "Most Abbotsford entry-level condos and townhomes qualify for the first-time buyer exemption" (in the schema) became "Many ..." to match the visible text.

## Check yourself before publishing
- Neighbourhood facts (for example Abbotsford Senior Secondary in West Abbotsford, MEI campus near Mill Lake, Reach Gallery in downtown, Clearbrook on South Fraser Way).
- BC property transfer tax rates and the first-time buyer thresholds ($835,000 / $860,000), which date from 2024.
- "the growing infrastructure makes it a smart investment" in Nader's Take is an investment claim; consider softening it.
- `/abbotsford` (area page) and `/abbotsford-listings` can compete with each other; give them different titles and cross-link them.
- Add Abbotsford to the `areaServed` list in the White Rock page's agent block next time you paste that page, so the shared agent entity matches.
- Not included: a Market snapshot section (as on the White Rock page). It can be added with the same data pipeline.
