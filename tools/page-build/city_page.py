#!/usr/bin/env python3
"""Generic generator for city listing pages. Usage: python3 city_page.py coquitlam
Writes <page>-improved.html (Embed code). Then run: python3 tools/market-refresh/build.py <city> to add the Market snapshot."""
import re, json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
NH = '&#8209;'
CONFIGS = {
 'coquitlam': dict(
  label='Coquitlam', page='coquitlam-listings', hero_word='Estates',
  nearby=[('/burnaby-listings', 'Burnaby homes for sale'), ('/coquitlam-presales', 'Coquitlam presales'), ('/coquitlam-sold-listings', 'recently sold Coquitlam homes')],
  life_h2='Why Coquitlam? Growth, Green Space &amp; Rail Access',
  life_sub=f'Coquitlam pairs a growing skyline with parks, heritage, and two separate rail lines toward Vancouver.',
  areas=["White Rock", "Surrey", "Burnaby", "Coquitlam", "Langley", "Delta", "Abbotsford"],
  agent_cities='White Rock, Surrey, Burnaby, Coquitlam, Langley and Abbotsford',
  sub=(f"Coquitlam is one of BC's largest cities and the fifth{NH}largest in Metro Vancouver, and one of its fastest{NH}growing since the Millennium Line's Evergreen Extension opened in 2016. The city pairs a rising Town Centre and Burquitlam skyline with leafier, established neighbourhoods like Westwood Plateau and the historic Francophone community of Maillardville. With hundreds of active listings, prices range widely, from a Town Centre condo to a Westwood Plateau estate. Whether you're looking for a <strong>SkyTrain{NH}connected condo</strong>, a <strong>new build on Burke Mountain</strong>, or a <strong>character home in Maillardville</strong>, Coquitlam has something for every stage."),
  faq=[
   ("Is Coquitlam a good place to invest in real estate right now?", f"Coquitlam has been one of Metro Vancouver's fastest{NH}growing cities since the Evergreen SkyTrain extension opened, with new development concentrated in Town Centre, Burquitlam, and Burke Mountain. Growth alone doesn't guarantee returns on any one street or building. Talk to Nader for a current{NH}day read on specific areas."),
   ("What's the property transfer tax on a home in Coquitlam, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Coquitlam's price points span a wide range, from Town Centre condos that can qualify for the first{NH}time buyer exemption (up to an $835,000 fair market value) to Westwood Plateau estates well into the top tax tier. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is Coquitlam from downtown Vancouver?", f"By car it is roughly 30 to 60 minutes via Highway 1, depending on the neighbourhood and traffic. By transit you can take the Millennium Line SkyTrain (with a transfer for downtown) or the West Coast Express commuter rail from Coquitlam Central."),
   ("Is Coquitlam part of Metro Vancouver?", f"Yes. Coquitlam is one of the largest municipalities in the Metro Vancouver Regional District, connected to the rest of the region by the Evergreen section of the Millennium Line and the West Coast Express commuter rail."),
   ("What school district serves Coquitlam?", f"Public schools fall under School District 43, which also covers Port Coquitlam and Port Moody. Douglas College's David Lam Campus, near Lafarge Lake, adds a local post{NH}secondary option."),
   ("What areas does this Coquitlam search cover?", f"This search covers Coquitlam, including Town Centre, Burquitlam, Westwood Plateau, Burke Mountain, Maillardville, and Austin Heights."),
  ],
  neigh=[
   ("Coquitlam Town Centre", f"The city's commercial core since Coquitlam Centre mall opened in 1979, now ringed by highrise condos, Lafarge Lake, and Douglas College's David Lam Campus."),
   ("Burquitlam", f"On the western border with Burnaby, a fast{NH}growing cluster of towers around the SkyTrain station."),
   ("Westwood Plateau", f"An upscale, master{NH}planned community wrapped around its own golf course, with larger detached homes and sweeping mountain views."),
   ("Burke Mountain", f"Coquitlam's newest growth area, still being built out with master{NH}planned single{NH}family homes and townhomes."),
   ("Maillardville", f"The oldest French{NH}Canadian community in Western Canada, known for character homes and a strong sense of heritage near the Fraser River."),
   ("Austin Heights", f"An established, walkable strip along Austin Avenue mixing character bungalows with newer infill townhomes."),
  ],
  life=[
   ("🚇", "The Evergreen Line", f"The Millennium Line's <strong>Evergreen Extension</strong> runs through Coquitlam, linking Burquitlam, Lincoln, Lafarge Lake{NH}Douglas, and Coquitlam Central to the rest of Metro Vancouver."),
   ("🚆", "West Coast Express", f"Coquitlam Central doubles as a <strong>West Coast Express</strong> stop, giving commuters a second rail option toward downtown Vancouver."),
   ("🏙️", "A Growing Skyline", f"New highrise development is changing the skyline around <strong>Town Centre</strong> and <strong>Burquitlam</strong>."),
   ("🎓", "Douglas College", f"The <strong>David Lam Campus</strong> sits right in Town Centre, next to Lafarge Lake."),
   ("⛳", "Golf &amp; Mountain Views", f"<strong>Westwood Plateau's</strong> golf{NH}course community is one of the region's most sought{NH}after upscale enclaves."),
   ("🌳", "Parks &amp; Lakes", f"<strong>Town Centre Park</strong>, Mundy Park, Como Lake Park, and Colony Farm Regional Park anchor the city's green space."),
   ("🇫🇷", "Francophone Heritage", f"<strong>Maillardville</strong> is widely described as the oldest French{NH}Canadian community in Western Canada."),
   ("🏗️", "Room to Grow", f"<strong>Burke Mountain</strong> remains one of the region's major areas of new{NH}home construction."),
  ],
  take=(f"Coquitlam is a market defined by growth. The Evergreen Line changed the equation for this whole corridor, and Burke Mountain is still being built out today. As an engineer, I pay attention to what's underneath a new build as much as what's on the surface: grading, drainage, and how a master{NH}planned community is phased. Buyers here are often choosing between an established character home in Maillardville and a brand{NH}new build on Burke Mountain, and the trade{NH}offs are real. I help them weigh both properly."),
 ),
}

CONFIGS['delta'] = dict(
  label='Delta', page='delta-listings', hero_word='Homes',
  hero_h2=f"Delta Homes for Sale: Coastal Estates, Heritage Character &amp; Family Homes",
  nearby=[('/surrey-listings', 'Surrey homes for sale'), ('/delta-presales', 'Delta presales'), ('/delta-sold-listings', 'recently sold Delta homes')],
  life_h2='Why Delta? Coastal Living, Heritage Character &amp; Room to Breathe',
  life_sub=f'Delta pairs small{NH}town heritage and coastal beaches with highway and ferry connections across the region.',
  areas=["White Rock", "Surrey", "Burnaby", "Coquitlam", "Delta", "Langley", "Abbotsford"],
  agent_cities='White Rock, Surrey, Burnaby, Coquitlam, Delta, Langley and Abbotsford',
  sub=(f"Delta is home to about 108,000 residents across three distinct communities: the historic fishing village of Ladner, the coastal community of Tsawwassen, gateway to the BC Ferries Tsawwassen terminal, and the family{NH}oriented suburbs of North Delta. Much of the city remains protected farmland and wetland, including roughly 40 square kilometres of Burns Bog, giving Delta a lower{NH}density, small{NH}town feel unusually close to Vancouver. With hundreds of active listings, prices range widely, from a North Delta condo to a Tsawwassen estate. Whether you're looking for a <strong>heritage character home in Ladner</strong>, a <strong>coastal property near Boundary Bay</strong>, or a <strong>family home in North Delta</strong>, Delta has something for every stage."),
  faq=[
   ("Is Delta a good place to invest in real estate right now?", f"Delta offers a mix of North Delta condos and townhomes with the coastal and heritage homes of Ladner and Tsawwassen, and prices vary widely from one community to the next. Low{NH}density zoning and protected farmland also limit how much new housing can be built. Talk to Nader for a current{NH}day read on specific areas."),
   ("What's the property transfer tax on a home in Delta, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Delta's price points span a wide range, from North Delta condos that can qualify for the first{NH}time buyer exemption (up to an $835,000 fair market value) to Tsawwassen estates well into the top tax tier. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is Delta from downtown Vancouver?", f"Delta has no SkyTrain station of its own. The closest is Scott Road Station on the Expo Line, just across the border in Surrey, reachable by bus from North Delta. By car, it's roughly 30 to 60 minutes to downtown Vancouver via Highway 99 and the George Massey Tunnel, depending on the neighbourhood and traffic."),
   ("Is Delta part of Metro Vancouver?", f"Yes. Delta is a municipality in the Metro Vancouver Regional District, made up of three communities (Ladner, Tsawwassen, and North Delta) and connected to the region by Highway 99, Highway 91's Alex Fraser Bridge, and the Tsawwassen Ferry Terminal."),
   ("What school district serves Delta?", f"Public schools fall under School District 37 (Delta), which serves the city on its own rather than sharing boundaries with a neighbouring municipality. Secondary schools include North Delta Secondary and Seaquam Secondary in North Delta, Delta Secondary in Ladner, and South Delta Secondary in Tsawwassen."),
   ("What areas does this Delta search cover?", f"This search covers Delta, including North Delta, Ladner, Tsawwassen, Sunshine Hills, Beach Grove, and the Boundary Bay area."),
  ],
  neigh=[
   ("North Delta", f"Delta's largest community, with suburban streets, townhome complexes and low{NH}rise condos, backing onto the protected wetlands of Burns Bog."),
   ("Ladner", f"Delta's historic administrative centre and former fishing village, with a walkable heritage core in Ladner Village."),
   ("Tsawwassen", f"A coastal South Delta community, home to the BC Ferries terminal, Tsawwassen Mills, and long beach walks along Boundary Bay."),
   ("Beach Grove", f"A quieter, tree{NH}lined enclave within Tsawwassen near the water, known for mature lots and easy beach access."),
   ("Tsawwassen Springs", f"A master{NH}planned community built around its own golf course at the edge of Tsawwassen."),
   ("Sunshine Hills", f"North Delta's hillside neighbourhood, prized for elevated view lots and larger single{NH}family homes."),
  ],
  life=[
   ("⛴️", "The Tsawwassen Ferry Terminal", f"BC Ferries' <strong>Tsawwassen terminal</strong> connects Delta to Vancouver Island and the Southern Gulf Islands."),
   ("🌉", "Highway 91 &amp; the Alex Fraser Bridge", f"Delta's northern edge crosses the Fraser River to New Westminster and Surrey via <strong>Highway 91</strong> and the Alex Fraser Bridge."),
   ("🚗", "Highway 99 &amp; the Massey Tunnel", f"The <strong>George Massey Tunnel</strong> carries Highway 99 under the Fraser River toward Richmond and Vancouver."),
   ("🦢", "Reifel Bird Sanctuary", f"Westham Island's <strong>George C. Reifel Migratory Bird Sanctuary</strong> draws birdwatchers, especially for the winter snow goose migration."),
   ("⛳", "Golf{NH}Course Living", f"<strong>Tsawwassen Springs</strong> is a master{NH}planned golf{NH}course community at the edge of Tsawwassen."),
   ("🌾", "Burns Bog &amp; Farmland", f"Delta protects roughly 40 square kilometres of wetland at <strong>Burns Bog</strong> alongside extensive Agricultural Land Reserve farmland."),
   ("🏖️", "Boundary Bay &amp; Centennial Beach", f"Long, flat beaches make South Delta a favourite for beach walks."),
   ("🏫", "A School District of Its Own", f"<strong>School District 37</strong> serves Delta on its own, without sharing boundaries with a neighbouring city."),
  ],
  take=(f"Delta is built on a river delta, with much of its low{NH}lying land protected by dikes. As an engineer, that's not a footnote, it's the first thing I look at: flood construction levels, drainage, and how a property sits relative to the dike system matter as much as the finishes inside. Buyers here are often choosing between a heritage home in Ladner Village, a coastal property near Boundary Bay, and a newer build in Tsawwassen Springs, and each comes with its own site considerations. I make sure they go in with eyes open."),
)
def plain(s): return re.sub(r'<[^>]+>', '', s).replace(NH, '-').replace('&amp;', '&')
def render(key):
    c = CONFIGS[key]; L = c['label']; PAGE = c['page']
    ab = open(f'{ROOT}/abbotsford-listings-improved.html', encoding='utf8').read()
    css = re.search(r'<style>(.*?)</style>', ab, re.S).group(1)
    ld = lambda o: '<script type="application/ld+json">\n' + json.dumps(o, indent=2, ensure_ascii=False) + '\n</script>\n'
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}} for q, a in c['faq']]}
    bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://home-nader.com/"}, {"@type": "ListItem", "position": 2, "name": f"{L} Homes for Sale", "item": f"https://home-nader.com/{PAGE}"}]}
    agent = {"@context": "https://schema.org", "@type": "RealEstateAgent", "@id": "https://home-nader.com/#agent", "name": "Nader Bakhoum, P.Eng., PMP", "url": "https://home-nader.com/", "telephone": "+1-604-612-7228", "email": "info@home-nader.com",
      "description": f"Residential, commercial and presale real estate in Metro Vancouver and the Fraser Valley, including {c['agent_cities']}.",
      "address": {"@type": "PostalAddress", "streetAddress": "7565 132 St", "addressLocality": "Surrey", "addressRegion": "BC", "postalCode": "V3W 1K5", "addressCountry": "CA"},
      "affiliation": {"@type": "Organization", "name": "eXp Realty Canada"}, "areaServed": [{"@type": "City", "name": n} for n in c['areas']]}
    faq_html = ''.join(f'        <details name="wr-faq">\n          <summary>{q}</summary>\n          <p>{a}</p>\n        </details>\n' for q, a in c['faq'])
    neigh_html = ''.join(f'        <div role="listitem">\n          <div class="wr-coord" aria-hidden="true">0{i+1}</div>\n          <h3>{h}</h3>\n          <p>{d}</p>\n        </div>\n' for i, (h, d) in enumerate(c['neigh']))
    life_html = ''.join(f'        <div role="listitem">\n          <h3><span aria-hidden="true">{e} </span>{h}</h3>\n          <p>{p}</p>\n        </div>\n' for e, h, p in c['life'])
    n = c['nearby']; near = f'<a href="{n[0][0]}">{n[0][1]}</a>, <a href="{n[1][0]}">{n[1][1]}</a>, or <a href="{n[2][0]}">{n[2][1]}</a>'
    page = f'''<!--
  /{PAGE}: improved custom code

  This file = the page's HTML/content block (Embed CODE box). It includes the fonts and structured data at the top.
  The Market snapshot numbers update automatically through the Page Script ({key}-market-loader.txt).
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
        <h2>{c.get('hero_h2') or (L + ' Homes for Sale: Condos, Townhomes &amp; Single' + NH + 'Family ' + c['hero_word'])}</h2>
        <p class="wr-sub">{c['sub']}</p>
        <p class="wr-note">Use the filters above to narrow the current listings by price, beds, and property type. Also looking nearby? See {near}.</p>
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
        <h2 id="wr-life-title">{c['life_h2']}</h2>
        <p>{c['life_sub']}</p>
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
            <p>"{c['take']}"</p>
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
    print('wrote', f'{PAGE}-improved.html', len(page), 'chars | neighbourhood marker:', '<section class="wr-block" aria-labelledby="wr-neigh-title">' in page, '| list elements:', len(re.findall(r'<(?:ul|ol|li)[ >]', page)))
if __name__ == '__main__': render(sys.argv[1])
