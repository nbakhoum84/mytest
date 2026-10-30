# /white-rock-listings: CMS SEO fields and change notes

## Set these in the CMS SEO fields (not in the code snippet)

| Field | Value |
|---|---|
| Title (57 chars) | `Homes for Sale in White Rock, BC | Nader Bakhoum – eXp` |
| Meta description (about 155 chars) | `Browse homes, condos and townhomes for sale in White Rock, BC, from oceanfront condos by the pier to hillside homes. Local insight from Nader Bakhoum, P.Eng.` |
| Canonical | `https://home-nader.com/white-rock-listings` (the platform already sets this) |
| Open Graph / Twitter image | A real hero image, at least 1200×630. The old code had `REPLACE-WITH-WHITE-ROCK-HERO-IMAGE.jpg`, which is a broken link. |

## What changed from the original code, and why

1. **Removed `<title>`, `<meta>`, canonical, Open Graph and Twitter tags.** The platform already outputs these (the live page's title is the platform's, not the snippet's). Meta tags placed in the body are unreliable, and duplicates can conflict. The old title was also about 83 characters and would truncate in results.
2. **Scoped all CSS under `.wr` with `wr-` class names.** The original had a global `* {margin:0; padding:0}`, a global `a {color:inherit}`, and `body`/`html` rules, which can restyle the platform's header, listing cards and footer.
3. **Removed dead CSS** (about 150 lines: `.stat-strip`, `.mix-bar`, `.listing-row`, `.featured-head`, `.display` and related rules that no element used).
4. **FAQ rebuilt with `<details>/<summary>`.** The original used buttons with `max-height: 260px`, which clips longer answers (the transfer-tax answer is long) on narrow screens. It also had no `aria-expanded`, so screen readers couldn't tell open from closed. The native version needs no JavaScript and is keyboard accessible. The `name` attribute keeps "one open at a time" in current browsers.
5. **Semantics and accessibility:** breadcrumb is a `<nav><ol>`, groups are lists, sections have `aria-labelledby`, decorative emoji are `aria-hidden`, and the quote uses `<figure>`/`<figcaption>`. Low-contrast footer text (`#8B8574` on `#F6F3EC`, about 3.3:1) is now `#6B6556` (about 5.2:1). All text is at least 12px (it was 10–11px in places).
6. **Fonts:** added `preconnect` to `fonts.gstatic.com` with `crossorigin`, dropped the unused Fraunces optical-size axis and unused weights, and added system font fallbacks. The italic blockquote is now upright, because the italic Fraunces file was never loaded and the browser was faking it.
7. **Structured data:**
   - `RealEstateAgent` now has `@id: https://home-nader.com/#agent` (the same id the platform's own block uses, so they merge) and `url` set to the homepage, not the listings page.
   - The BreadcrumbList no longer has a mislabelled "Residential" step that pointed at this same page, plus an unlinked third item.
   - FAQ text now matches what's visible on the page, with the broken calculator link replaced.
8. **Links:** three links in the original returned an empty page (`/white-rock-ocean-view-homes`, `/mortgage-land-transfer-tax-calculator`, `/mortgage-payment-calculator`). They are replaced with working pages (`/cash-to-close`, `/mortgage-calculators`). Added links to `/south-surrey-listings`, `/white-rock-presales` and `/white-rock-sold-listings`. Re-add the ocean-view guide link once that page exists.
9. **Removed the duplicate header and footer blocks** (name, phone, email, address). The platform already renders them, and a second copy on the same page is redundant.
10. **Removed one claim:** "…a title it shares, depending who's counting, with a wharf in Quebec." I couldn't verify it. The pier claim is now limited to what the city's signage says.

## Please verify before publishing

- **West Beach description.** The original said "toward the border crossing". I removed that phrase because it looks geographically off, but please confirm the remaining description is right.
- **BC property transfer tax figures and the first-time buyer thresholds** ($835,000 / $860,000). These were set in 2024. Check the current BC government figures, as thresholds change.
- **Page 2+ of the listing results.** Make sure paginated pages have their own canonical URLs.
- **Visual check on desktop and phone** after pasting, particularly that the removed header and footer didn't leave a gap.
- **Google no longer shows FAQ rich results for most sites.** The FAQ schema is still harmless and useful for AI answers, but don't expect expandable results in search.
