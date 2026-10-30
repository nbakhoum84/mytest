#!/usr/bin/env python3
"""Generates burnaby-listings-improved.html (Embed code) using the shared styles of the other city pages.
The Market snapshot section is added afterwards by tools/market-refresh/build.py burnaby."""
import re, json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ab = open(f'{ROOT}/abbotsford-listings-improved.html', encoding='utf8').read()
css = re.search(r'<style>(.*?)</style>', ab, re.S).group(1)
L = 'Burnaby'; PAGE = 'burnaby-listings'; SLUG = 'burnaby'
NH = '&#8209;'
FAQ = [
 ("Is Burnaby a good place to invest in real estate right now?", f"Burnaby is one of Metro Vancouver's most active transit{NH}oriented markets, with major highrise development concentrated around Metrotown, Brentwood, and Lougheed. Density and SkyTrain access tend to support long{NH}term demand, though pricing varies widely by neighbourhood and building age. Talk to Nader for a current{NH}day read on specific towers and streets."),
 ("What's the property transfer tax on a home in Burnaby, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Given Burnaby's higher average price points, more purchases land in the upper tiers, and fewer entry{NH}level buyers qualify for the full first{NH}time buyer exemption (available up to an $835,000 fair market value). Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
 ("How far is Burnaby from downtown Vancouver?", f"Burnaby shares a border with Vancouver, so it's typically 15 to 30 minutes by car depending on the neighbourhood and traffic, or a SkyTrain ride on the Expo or Millennium line."),
 ("Is Burnaby part of Metro Vancouver?", f"Yes. Burnaby is one of the core municipalities of the Metro Vancouver Regional District and borders the City of Vancouver directly."),
 ("What school district and post-secondary options serve Burnaby?", f"Public schools fall under Burnaby School District 41. The city is also home to Simon Fraser University's main campus on Burnaby Mountain and the main campus of BCIT, both of which support steady rental demand nearby."),
 ("What areas does this Burnaby search cover?", f"This search covers Burnaby, including Metrotown, Brentwood, Lougheed, Burnaby Heights, Edmonds, and the Deer Lake / Government Road area."),
]
NEIGH = [
 ("Metrotown", f"Burnaby's largest urban hub, anchored by Metropolis at Metrotown, one of BC's biggest shopping centres, and a fast{NH}growing cluster of highrise condo towers around the SkyTrain station."),
 ("Brentwood", f"Home to the Gilmore Place towers and The Amazing Brentwood mall, a major pre{NH}sale and highrise area in the region."),
 ("Lougheed", f"Where the Expo and Millennium SkyTrain lines meet, with a major multi{NH}tower redevelopment around Lougheed Town Centre."),
 ("Burnaby Heights", f"A walkable, low{NH}rise North Burnaby neighbourhood along Hastings Street, known for character homes and an easy hop into East Vancouver."),
 ("Edmonds", f"An established, comparatively affordable pocket of South Burnaby near the SkyTrain and the New Westminster border, popular with families."),
 ("Deer Lake / Government Rd", f"Burnaby's green, low{NH}density core: Deer Lake Park, the Burnaby Village Museum, and larger detached lots near Burnaby Mountain."),
]
LIFE = [
 ("🏙️", "A Rising Skyline", f"Burnaby is one of Metro Vancouver's most vertical cities, with highrise clusters around <strong>Metrotown</strong>, <strong>Brentwood</strong> and <strong>Lougheed</strong>."),
 ("🚇", "Two SkyTrain Lines", f"Both the <strong>Expo</strong> and <strong>Millennium</strong> lines run through Burnaby, linking Metrotown, Brentwood, and Lougheed to the rest of Metro Vancouver."),
 ("🎓", "SFU on the Mountain", f"<strong>Simon Fraser University's</strong> main campus crowns Burnaby Mountain, with sweeping views over the Fraser Valley."),
 ("🌳", "The City of Parks", f"It's Burnaby's official tagline for a reason: <strong>Deer Lake</strong>, <strong>Burnaby Lake</strong>, and <strong>Central Park</strong> anchor the green space between the towers."),
 ("🛍️", "Major Shopping Hubs", f"<strong>Metropolis at Metrotown</strong> and <strong>The Amazing Brentwood</strong> are two of the busiest retail and entertainment centres in the region."),
 ("📚", "Schools &amp; BCIT", f"Public schools fall under <strong>Burnaby School District 41</strong>, and the city hosts the main campus of <strong>BCIT</strong> as well."),
 ("🏢", "A Major Job Market", f"Burnaby is a major employment centre in Metro Vancouver, with steady demand from renters and buyers alike."),
 ("🚗", "Right Next to Vancouver", f"Burnaby borders the City of Vancouver directly. Downtown is a short SkyTrain ride or drive away, depending on the neighbourhood."),
]
TAKE = (f"As an engineer, I appreciate a market built around infrastructure, and in Burnaby the SkyTrain runs right through it. Between Metrotown, Brentwood, and Lougheed, this is one of the fastest{NH}changing skylines in the region, and buyers who understand the difference between a pre{NH}sale highrise and an established low{NH}rise strata make much better decisions. I help my clients read the fine print, not just the view.")
SUB = (f"Burnaby is the third{NH}largest city in Metro Vancouver and one of its most vertical, with highrise towers around Metrotown, Brentwood, and Lougheed. It's home to Simon Fraser University's main campus on Burnaby Mountain and BCIT, and is served by both the Expo and Millennium SkyTrain lines. With hundreds of active listings, prices range widely, from a studio condo to a detached family home. Whether you're after a <strong>highrise unit near Metrotown</strong>, a <strong>townhome in Edmonds</strong>, or a <strong>house near Deer Lake</strong>, Burnaby has something for every budget.")
def plain(s): return re.sub(r'<[^>]+>', '', s).replace(NH, '-').replace('&amp;', '&')
ld = lambda o: '<script type="application/ld+json">\n' + json.dumps(o, indent=2, ensure_ascii=False) + '\n</script>\n'
faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}} for q, a in FAQ]}
bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://home-nader.com/"}, {"@type": "ListItem", "position": 2, "name": "Burnaby Homes for Sale", "item": f"https://home-nader.com/{PAGE}"}]}
agent = {"@context": "https://schema.org", "@type": "RealEstateAgent", "@id": "https://home-nader.com/#agent", "name": "Nader Bakhoum, P.Eng., PMP", "url": "https://home-nader.com/", "telephone": "+1-604-612-7228", "email": "info@home-nader.com",
 "description": "Residential, commercial and presale real estate in Metro Vancouver and the Fraser Valley, including White Rock, Surrey, Burnaby, Langley and Abbotsford.",
 "address": {"@type": "PostalAddress", "streetAddress": "7565 132 St", "addressLocality": "Surrey", "addressRegion": "BC", "postalCode": "V3W 1K5", "addressCountry": "CA"},
 "affiliation": {"@type": "Organization", "name": "eXp Realty Canada"}, "areaServed": [{"@type": "City", "name": n} for n in ["White Rock", "Surrey", "Burnaby", "Langley", "Delta", "Abbotsford"]]}
faq_html = ''.join(f'        <details name="wr-faq">\n          <summary>{q}</summary>\n          <p>{a}</p>\n        </details>\n' for q, a in FAQ)
neigh_html = ''.join(f'        <div role="listitem">\n          <div class="wr-coord" aria-hidden="true">0{i+1}</div>\n          <h3>{h}</h3>\n          <p>{d}</p>\n        </div>\n' for i, (h, d) in enumerate(NEIGH))
life_html = ''.join(f'        <div role="listitem">\n          <h3><span aria-hidden="true">{e} </span>{h}</h3>\n          <p>{p}</p>\n        </div>\n' for e, h, p in LIFE)
page = f'''<!--
  /{PAGE}: improved custom code

  This file = the page's HTML/content block (Embed CODE box). It includes the fonts and structured data at the top.
  The Market snapshot numbers update automatically through the Page Script (burnaby-market-loader.txt).
  Title, meta description, canonical and Open Graph are NOT included on purpose: set them in the CMS SEO fields.
-->

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet" />

{ld(faq_ld)}
{ld(bc)}
<!-- One agent entity. Same @id as the platform's own block and the other city pages so they merge. -->
{ld(agent)}

<style>
{css}</style>

<div class="wr">
  <div class="wr-hero-bg">
    <div class="wr-wrap">
      <nav class="wr-crumbs" aria-label="Breadcrumb">
          <a href="https://home-nader.com/">Home</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{L}</span>
        </nav>

      <header class="wr-hero">
        <div class="wr-eyebrow">{L}, BC</div>
        <!-- The platform already outputs the page's single H1, so this stays an H2. -->
        <h2>{L} Homes for Sale: Condos, Townhomes &amp; Single{NH}Family Homes</h2>
        <p class="wr-sub">{SUB}</p>
        <p class="wr-note">Use the filters above to narrow the current listings by price, beds, and property type. Also looking nearby? See <a href="/vancouver-listings">Vancouver homes for sale</a>, <a href="/burnaby-presales">Burnaby presales</a>, or <a href="/burnaby-sold-listings">recently sold Burnaby homes</a>.</p>
      </header>
    </div>
  </div>

  <section class="wr-block" aria-labelledby="wr-neigh-title">
    <div class="wr-wrap">
      <div class="wr-head">
        <div class="wr-eyebrow">Coverage</div>
        <h2 id="wr-neigh-title">Neighbourhoods in {L}</h2>
        <p>This search spans the following {L} communities.</p>
      </div>
      <div class="wr-neigh" role="list">
{neigh_html}      </div>
    </div>
  </section>

  <section class="wr-block" aria-labelledby="wr-life-title">
    <div class="wr-wrap">
      <div class="wr-head">
        <div class="wr-eyebrow">Lifestyle</div>
        <h2 id="wr-life-title">Why {L}? Skyline, SkyTrain &amp; Central Location</h2>
        <p>{L} combines big{NH}city transit and amenities with parks and green space.</p>
      </div>
      <div class="wr-life" role="list">
{life_html}      </div>
    </div>
  </section>

  <section class="wr-take" aria-label="Nader's take">
    <div class="wr-wrap">
      <div class="wr-take-inner">
        <div class="wr-take-label">Nader's Take</div>
        <figure>
          <blockquote>
            <p>"{TAKE}"</p>
          </blockquote>
          <figcaption><cite>Nader Bakhoum, PMP, P.Eng.</cite></figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="wr-block" aria-labelledby="wr-faq-title">
    <div class="wr-wrap">
      <div class="wr-head">
        <div class="wr-eyebrow">FAQ</div>
        <h2 id="wr-faq-title">Frequently Asked Questions About {L} Real Estate</h2>
      </div>
      <div class="wr-faq">
{faq_html}      </div>
    </div>
  </section>

  <section class="wr-block wr-block-tight" aria-label="Next steps">
    <div class="wr-wrap">
      <div class="wr-cta">
        <div>
          <div class="wr-mono">For Buyers</div>
          <h3>Run the numbers on a {L} home</h3>
          <a href="/mortgage-calculators" class="wr-btn">Mortgage calculators <span aria-hidden="true">→</span></a>
        </div>
        <div>
          <div class="wr-mono">For Sellers</div>
          <h3>What's Your {L} Home Worth?</h3>
          <a href="/seller-guide" class="wr-btn">Get the Seller's Guide <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  </section>

  <p class="wr-legal">IDX information is provided exclusively for consumers' personal, non{NH}commercial use and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing. Information deemed reliable but not guaranteed to be accurate. Listing information updated daily.</p>
</div>
'''
open(f'{ROOT}/{PAGE}-improved.html', 'w', encoding='utf8').write(page)
print('wrote', f'{PAGE}-improved.html', len(page), 'chars; has neighbourhood marker:', '<section class="wr-block" aria-labelledby="wr-neigh-title">' in page, '| lists left:', len(re.findall(r'<(?:ul|ol|li)[ >]', page)))
