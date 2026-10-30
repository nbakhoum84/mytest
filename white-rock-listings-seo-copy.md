# /white-rock-listings: paste-ready SEO content

Fill every `[BRACKET]` from current MLS data before publishing. Do not publish placeholder numbers.

## 1. Page settings (CMS SEO fields)

**Title (57 chars):**
`Homes for Sale in White Rock, BC | Nader Bakhoum – eXp`

**Meta description (about 150 chars):**
`Browse [N] homes, condos and townhomes for sale in White Rock, BC. Updated daily, with local market stats from Nader Bakhoum, P.Eng., PMP, eXp Realty.`

**H1 (keep):** `White Rock Homes for Sale`

**Canonical:** keep self-referencing: `https://home-nader.com/white-rock-listings`

## 2. Intro (place directly under the H1, above the listings)

> Browse [N] homes for sale in White Rock, BC, from beachside condos to character homes on the hill. Listings update daily from the MLS. Want help narrowing them down? [Book a free consultation](/contact) or [save this search](#) to get new listings by email.

(Two sentences, with the CTA visible without scrolling.)

## 3. Main copy block (replace the current ~183-word block, about 550 words)

**H2: White Rock Real Estate Market – [Month Year] Update**

As of [Month Year], White Rock has [N] active listings. The average list price is [$X]: [$X] for condos, [$X] for townhomes and [$X] for single-family homes. Homes are taking about [N] days to sell, and [N] homes sold in the past 30 days.

[One or two sentences on the trend: is inventory up or down versus last year, and is it a buyer's or seller's market?]

**H2: White Rock Homes for Sale – Condos, Townhomes & Single-Family Homes** *(keep the existing H2)*

White Rock is one of the smallest cities in Metro Vancouver by land area, wrapped around Semiahmoo Bay and anchored by the 470-metre White Rock Pier, built in 1914. Though Surrey surrounds it, White Rock has governed itself as an independent city since 1957, with its own council and its own hospital. [Keep the rest of your current paragraph.]

**H3: Condos for sale in White Rock**
[2–3 sentences: price range, typical buildings or areas near Marine Drive and Uptown, who buys them (downsizers, first-time buyers, investors).] See [White Rock condos](/white-rock-listings).

**H3: Townhomes for sale in White Rock**
[2–3 sentences.]

**H3: Single-family homes and waterfront**
[2–3 sentences: bluff, ocean-view and character homes. Link to your ocean-view guide.]

**H2: Neighbourhoods in White Rock** *(keep the existing section, and add 1–2 sentences per area)*
[Match the neighbourhood names your page already lists. For each, give the vibe, the typical price range and walkability.]

**H2: Thinking about buying or selling in White Rock?**

I'm Nader Bakhoum, a P.Eng. and PMP with eXp Realty, and I help buyers and sellers across White Rock and South Surrey. I use an engineering approach: realistic numbers, cash-flow and ROI analysis, and a clear plan. [Optional: add a sentence about your experience and results.]

- [Get a free home valuation](/sell)
- [See recently sold homes in White Rock](/white-rock-sold-listings)
- [Browse White Rock presales](/white-rock-presales)
- [Also searching nearby? See South Surrey homes for sale](/south-surrey-listings)
- [First-time buyer? Read the home buyer's guide](/home-buyers-guide)
- [Estimate your closing costs](/cash-to-close)

(That is six contextual internal links with descriptive anchors.)

## 4. Added FAQ entries (keep the existing 6; add these to the FAQ block and the schema)

- **How much does a home cost in White Rock?** [Answer using your stats: average by type.]
- **What is the best time of year to buy in White Rock?** [Answer. Search demand peaks in spring.]
- **Do I need an agent to buy a home in White Rock?** [Answer.]

## 5. Structured data: replace the two RealEstateAgent blocks with this one

Remove the standalone `RealEstateAgent` block and the one inside the `@graph`, and keep a single block. Keep the existing FAQPage and BreadcrumbList blocks. If your CMS only has one custom-code field, include all three there. Remove or cap the open-house Event blocks if the CMS lets you.

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": "https://home-nader.com/#agent",
  "name": "Nader Bakhoum, P.Eng., PMP",
  "url": "https://home-nader.com/",
  "telephone": "+1-604-612-7228",
  "email": "info@home-nader.com",
  "description": "Residential, commercial and presale real estate in Metro Vancouver, including White Rock and South Surrey.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "7565 132 St",
    "addressLocality": "Surrey",
    "addressRegion": "BC",
    "postalCode": "V3W 1K5",
    "addressCountry": "CA"
  },
  "affiliation": { "@type": "Organization", "name": "eXp Realty Canada" },
  "areaServed": [
    { "@type": "City", "name": "White Rock" },
    { "@type": "City", "name": "Surrey" },
    { "@type": "City", "name": "Langley" },
    { "@type": "City", "name": "Delta" }
  ]
}
```

Add the same `@id` and `url: https://home-nader.com/` to any other pages' agent blocks so Google sees one entity. Keep the `sameAs` social links from your current block.

## 6. Quick checklist

- [ ] Title and description updated
- [ ] Intro and CTA above the listings
- [ ] Market-stats section filled with real data and dated
- [ ] 3 property-type sections and neighbourhood blurbs written
- [ ] 6 internal links added to the body copy
- [ ] Schema merged to one agent block, with the homepage as its `url`
- [ ] Search Console → URL Inspection → "Request indexing"
- [ ] Differentiate `/white-rock` (area guide) from this page (listings) so they don't compete
