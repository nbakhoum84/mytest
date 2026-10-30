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
   ("⛳", f"Golf{NH}Course Living", f"<strong>Tsawwassen Springs</strong> is a master{NH}planned golf{NH}course community at the edge of Tsawwassen."),
   ("🌾", "Burns Bog &amp; Farmland", f"Delta protects roughly 40 square kilometres of wetland at <strong>Burns Bog</strong> alongside extensive Agricultural Land Reserve farmland."),
   ("🏖️", "Boundary Bay &amp; Centennial Beach", f"Long, flat beaches make South Delta a favourite for beach walks."),
   ("🏫", "A School District of Its Own", f"<strong>School District 37</strong> serves Delta on its own, without sharing boundaries with a neighbouring city."),
  ],
  take=(f"Delta is built on a river delta, with much of its low{NH}lying land protected by dikes. As an engineer, that's not a footnote, it's the first thing I look at: flood construction levels, drainage, and how a property sits relative to the dike system matter as much as the finishes inside. Buyers here are often choosing between a heritage home in Ladner Village, a coastal property near Boundary Bay, and a newer build in Tsawwassen Springs, and each comes with its own site considerations. I make sure they go in with eyes open."),
)

CONFIGS['langley'] = dict(
  label='Langley', page='langley-listings', hero_word='Homes',
  nearby=[('/surrey-listings', 'Surrey homes for sale'), ('/langley-presales', 'Langley presales'), ('/langley-sold-listings', 'recently sold Langley homes')],
  life_h2='Why Langley? History, Growth &amp; Open Space',
  life_sub=f"Langley pairs one of the region's fastest{NH}growing suburbs with some of its deepest history.",
  areas=["White Rock", "Surrey", "Burnaby", "Coquitlam", "Delta", "Langley", "Abbotsford"],
  agent_cities='White Rock, Surrey, Burnaby, Coquitlam, Delta, Langley and Abbotsford',
  sub=(f"Langley spans both the Township of Langley and the City of Langley, and it's one of the Fraser Valley corridor's major growth areas. Willoughby is one of the region's fastest{NH}growing master{NH}planned communities, the Surrey{NH}Langley SkyTrain extension is under construction and currently scheduled to reach Langley City Centre in late 2029, and Fort Langley, a National Historic Site, is where the mainland Colony of British Columbia was proclaimed in 1858. With hundreds of active listings, prices range widely, from a Willoughby condo to an acreage near Fort Langley. Whether you're after a <strong>new townhome in Willoughby</strong>, a <strong>family home in Walnut Grove</strong>, or a <strong>character property near Fort Langley</strong>, Langley has it."),
  faq=[
   ("Is Langley a good place to invest in real estate right now?", f"Langley is in the middle of two long{NH}term changes at once: the Surrey{NH}Langley SkyTrain extension under construction, and the ongoing build{NH}out of Willoughby. Both tend to support demand along their corridors, though timing and location within Langley matter a lot. Talk to Nader for a read on a specific area."),
   ("What's the property transfer tax on a home in Langley, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Some Willoughby condos and townhomes can qualify for the first{NH}time buyer exemption (up to an $835,000 fair market value), while larger acreages can land in the higher tax tiers. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is Langley from downtown Vancouver?", f"About 45 to 60 minutes by car via Highway 1, depending on traffic and which part of Langley you're in. Transit times are expected to improve once the Surrey{NH}Langley SkyTrain extension opens, which is currently scheduled for late 2029."),
   ("Is Langley part of Metro Vancouver?", f"Yes. Both the Township of Langley and the City of Langley are member municipalities of the Metro Vancouver Regional District."),
   ("What's the difference between the Township of Langley and the City of Langley?", f"They're two separate municipalities with their own councils, even though they share a name and are usually searched and marketed together. The City of Langley is the smaller, denser core; the Township surrounds it and includes Willoughby, Walnut Grove, Fort Langley, Brookswood, Murrayville, and Aldergrove."),
   ("What areas does this Langley search cover?", f"This search covers Langley, including Fort Langley, Willoughby, Walnut Grove, Brookswood, Murrayville, and Aldergrove."),
  ],
  neigh=[
   ("Fort Langley", f"A National Historic Site and the birthplace of the mainland Colony of British Columbia, with a walkable village core of shops, caf&eacute;s, and heritage homes."),
   ("Willoughby", f"One of Langley's fastest{NH}growing areas, with new townhome and condo construction around Willoughby Town Centre."),
   ("Walnut Grove", f"An established, family{NH}oriented community near the Fraser River, popular for its schools and parks."),
   ("Brookswood", f"A leafy, low{NH}density neighbourhood of larger lots that's slowly transitioning to newer construction as the area redevelops."),
   ("Murrayville", f"A quiet, established pocket around Murrayville's small commercial strip, close to Langley's hospital and recreation centre."),
   ("Aldergrove", f"Langley's easternmost community, more rural in feel, with larger acreages and easy access to Highway 1."),
  ],
  life=[
   ("🚇", "SkyTrain Is Coming", f"The <strong>Surrey{NH}Langley SkyTrain</strong> extension is under construction and currently scheduled to reach Langley City Centre in late 2029."),
   ("🏰", "Fort Langley", f"A National Historic Site marking where the mainland Colony of British Columbia was proclaimed in 1858."),
   ("🎓", "Two Universities", f"<strong>Trinity Western University</strong> and a <strong>Kwantlen Polytechnic University</strong> campus both call Langley home."),
   ("🏗️", "Still Being Built", f"Willoughby is one of the region's major areas of master{NH}planned new construction."),
   ("🌳", "Parks &amp; Farmland", f"From Campbell Valley Regional Park to working farms, Langley has plenty of open space."),
   ("🛍️", f"Walking{NH}Village Shopping", f"Fort Langley's village core and Willoughby Town Centre offer two very different retail experiences."),
   ("📚", "Schools", f"Public schools fall under <strong>School District 35 Langley</strong>."),
   ("🚗", "Highway 1 Corridor", f"Langley sits directly on the Trans{NH}Canada Highway, midway between Abbotsford and Surrey."),
  ],
  take=(f"Langley is a market in two speeds: Willoughby is being built out almost block by block, while Fort Langley changes very little. As an engineer, I like watching how a new SkyTrain extension can reshape value along its corridor, and the question for any buyer is how much of that is already in today's prices. I help my clients figure out whether they're buying the neighbourhood as it is today, or the one it's about to become."),
)

CONFIGS['newwestminster'] = dict(
  label='New Westminster', page='new-westminster-listings', hero_word='Homes',
  hero_h2="New Westminster Homes for Sale: Condos, Townhomes &amp; Character Homes",
  nearby=[('/burnaby-listings', 'Burnaby homes for sale'), ('/new-westminster-presales', 'New Westminster presales'), ('/new-westminster-sold-listings', 'recently sold New Westminster homes')],
  life_h2='Why New Westminster? History, Transit &amp; the Waterfront',
  life_sub=f"New Westminster fits a lot of history and transit into one of the region's smallest cities.",
  areas=["White Rock", "Surrey", "Burnaby", "New Westminster", "Coquitlam", "Delta", "Langley", "Abbotsford"],
  agent_cities='White Rock, Surrey, Burnaby, New Westminster, Coquitlam, Delta, Langley and Abbotsford',
  sub=(f"New Westminster, known as the Royal City, was the original capital of the Colony of British Columbia before Victoria took over the role in 1868, and it's one of the smallest, most densely built cities in Metro Vancouver today. Both the Expo and Millennium SkyTrain lines serve it, with several stations packed into a compact city. With hundreds of active listings, prices range widely, from a Downtown condo to a character home in Queens Park. Whether you're after a <strong>highrise unit along the Quay</strong>, a <strong>heritage home in Queens Park</strong>, or a <strong>townhome in Sapperton</strong>, New West packs a lot into a small footprint."),
  faq=[
   ("Is New Westminster a good place to invest in real estate right now?", f"New Westminster's small footprint and SkyTrain access tend to support steady demand, particularly for condos near the Quay and Uptown. Talk to Nader for a current{NH}day read on a specific building or street."),
   ("What's the property transfer tax on a home in New Westminster, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. New Westminster's smaller average price points mean some purchases, especially condos, can qualify for the first{NH}time buyer exemption up to an $835,000 fair market value. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is New Westminster from downtown Vancouver?", f"About 25 to 40 minutes by SkyTrain on the Expo Line, or roughly 25 to 40 minutes by car depending on traffic."),
   ("Is New Westminster part of Metro Vancouver?", f"Yes. New Westminster is a member municipality of the Metro Vancouver Regional District and one of the smallest by land area."),
   ("What school district and post-secondary options serve New Westminster?", f"Public schools fall under School District 40. The city is also home to Douglas College's New Westminster campus."),
   ("What areas does this New Westminster search cover?", f"This search covers New Westminster, including Downtown/The Quay, Queens Park, Sapperton, Uptown, Glenbrooke North, and Queensborough."),
  ],
  neigh=[
   ("Downtown / The Quay", f"New Westminster's SkyTrain{NH}connected waterfront core, with a boardwalk market and a fast{NH}growing cluster of highrise condos along the Fraser River."),
   ("Queens Park", f"The city's best{NH}known heritage neighbourhood, full of character homes around Queen's Park itself."),
   ("Sapperton", f"Home to Royal Columbian Hospital, with a growing mix of townhomes and low{NH}rise condos near the Braid and Sapperton SkyTrain stations."),
   ("Uptown", f"New Westminster's commercial spine along Sixth Street and Sixth Avenue, walkable and increasingly dense with new development."),
   ("Glenbrooke North", f"An established, mid{NH}density neighbourhood of older houses and low{NH}rise apartments between Uptown and Queens Park."),
   ("Queensborough", f"A distinct community on Lulu Island, connected by the Queensborough Bridge, with newer master{NH}planned townhome and single{NH}family development."),
  ],
  life=[
   ("👑", "The Royal City", f"New Westminster was the original capital of the Colony of British Columbia, before Victoria took over the role in 1868."),
   ("🚇", "Two SkyTrain Lines", f"The Expo and Millennium lines both serve New Westminster, including the 22nd Street, New Westminster, Columbia, Sapperton, and Braid stations. That's a lot of rapid transit for a small city."),
   ("🏥", "Royal Columbian Hospital", f"One of the region's major hospitals, with trauma and cardiac services, is based in Sapperton."),
   ("🎓", "Douglas College", f"New Westminster is home to a main campus of Douglas College."),
   ("🏞️", "The Quay Boardwalk", f"A riverfront walkway and market along the Fraser River, a short walk from the SkyTrain."),
   ("🏘️", "Heritage Streets", f"Queens Park's tree{NH}lined streets hold some of the city's best{NH}known character homes."),
   ("📚", "Schools", f"Public schools fall under <strong>School District 40 New Westminster</strong>."),
   ("📏", "Compact by Design", f"New Westminster is one of the smallest cities by land area in Metro Vancouver, which is part of why it's so walkable."),
  ],
  take=(f"New Westminster rewards buyers who think in blocks, not kilometres. It's one of the smallest cities in the region, and the difference between the Quay and Queens Park can be a short walk and a completely different kind of property. As an engineer, I pay close attention to building age here, since the mix of century{NH}old character homes and newer highrises means due diligence looks different street to street. I help my clients match the neighbourhood's age profile to what they're actually buying."),
)

CONFIGS['portcoquitlam'] = dict(
  label='Port Coquitlam', page='port-coquitlam-listings', hero_word='Homes',
  nearby=[('/coquitlam-listings', 'Coquitlam homes for sale'), ('/port-coquitlam-presales', 'Port Coquitlam presales'), ('/port-coquitlam-sold-listings', 'recently sold Port Coquitlam homes')],
  life_h2='Why Port Coquitlam? Trails, Rivers &amp; a Quieter Pace',
  life_sub=f"PoCo has a more small{NH}town feel than much of the Tri{NH}Cities.",
  areas=["White Rock", "Surrey", "Burnaby", "New Westminster", "Coquitlam", "Port Coquitlam", "Delta", "Langley", "Abbotsford"],
  agent_cities='White Rock, Surrey, Burnaby, New Westminster, Coquitlam, Port Coquitlam, Delta, Langley and Abbotsford',
  sub=(f"Port Coquitlam, known locally as PoCo, is a smaller, family{NH}oriented city at the meeting of the Coquitlam, Fraser and Pitt Rivers, best known for the Traboulay PoCo Trail that loops the entire city and for being where Terry Fox grew up. Unlike neighbouring Coquitlam, PoCo isn't on the SkyTrain network, though Port Coquitlam station connects commuters to downtown Vancouver on the West Coast Express. With hundreds of active listings, prices range widely, from a townhome to a larger family home. Whether you're after a <strong>starter townhome in Oxford Heights</strong>, a <strong>character home downtown</strong>, or a <strong>house near the PoCo Trail</strong>, Port Coquitlam keeps things a little quieter than its neighbours."),
  faq=[
   ("Is Port Coquitlam a good place to invest in real estate right now?", f"Port Coquitlam is a smaller, family{NH}oriented market without direct SkyTrain access, and its growth has been more gradual than neighbouring Coquitlam's. Talk to Nader for a current{NH}day read on a specific street."),
   ("What's the property transfer tax on a home in Port Coquitlam, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Some Port Coquitlam purchases, especially townhomes and condos, can qualify for the first{NH}time buyer exemption up to an $835,000 fair market value. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is Port Coquitlam from downtown Vancouver?", f"By car it's roughly 30 to 60 minutes via the Lougheed Highway or Highway 1, depending on traffic. The West Coast Express from Port Coquitlam station takes roughly 40 to 50 minutes and currently runs on weekday rush{NH}hour schedules, so check TransLink for the latest times."),
   ("Is Port Coquitlam on the SkyTrain?", f"No. Unlike Coquitlam, Port Coquitlam isn't directly served by SkyTrain. Port Coquitlam station on the West Coast Express and bus connections to nearby Coquitlam stations are the main transit options."),
   ("What school district serves Port Coquitlam?", f"Public schools fall under School District 43, the same district that covers Coquitlam and Port Moody."),
   ("What areas does this Port Coquitlam search cover?", f"This search covers Port Coquitlam, including Downtown, Oxford Heights, Citadel Heights, Riverside, Mary Hill, and Birchland Manor."),
  ],
  neigh=[
   ("Downtown PoCo", f"The city's historic core along Shaughnessy Street, with older character homes and an easy walk to Gates Park."),
   ("Oxford Heights", f"A hillside neighbourhood of established homes and townhomes."),
   ("Citadel Heights", f"A newer, family{NH}oriented area close to the Coquitlam River and the PoCo Trail."),
   ("Riverside", f"Bordering the Fraser and Pitt Rivers, mixing industrial land with pockets of newer residential development."),
   ("Mary Hill", f"An established, hillside neighbourhood with larger lots and views across the valley."),
   ("Birchland Manor", f"A quiet, established neighbourhood of single{NH}family homes near Birchland Elementary and Hyde Creek."),
  ],
  life=[
   ("🏃", "The PoCo Trail", f"The Traboulay PoCo Trail loops the entire city, giving residents a long, continuous trail system close to home."),
   ("🏅", "Terry Fox's Hometown", f"Port Coquitlam is where Terry Fox grew up, and the city has honoured him with a secondary school and a library."),
   ("🚆", "West Coast Express", f"Port Coquitlam station connects commuters to downtown Vancouver on the West Coast Express commuter rail."),
   ("🎆", "Gates Park", f"Gates Park, close to Downtown PoCo, is a popular spot for community events and everyday outdoor time."),
   ("🌳", "Rivers &amp; Parks", f"The Coquitlam, Fraser and Pitt Rivers frame the city, with parks and trails running along them."),
   ("🏘️", "A Quieter Pace", f"PoCo has a more small{NH}town feel than much of the Tri{NH}Cities."),
   ("📚", "Schools", f"Public schools fall under <strong>School District 43</strong>, shared with Coquitlam and Port Moody."),
   ("🚗", "Highway Access", f"The Lougheed Highway and Mary Hill Bypass connect PoCo to the rest of the Tri{NH}Cities and beyond."),
  ],
  take=(f"Port Coquitlam doesn't try to be Coquitlam, and that's exactly its appeal. It's the quieter, more family{NH}oriented option in the Tri{NH}Cities, without the highrise pace next door. As an engineer, I look closely at the age and condition of a home, which matters most in established neighbourhoods like these. I help my clients weigh that quieter pace against the shorter commute options in neighbouring Coquitlam."),
)

CONFIGS['portmoody'] = dict(
  label='Port Moody', page='port-moody-listings', hero_word='Homes',
  nearby=[('/coquitlam-listings', 'Coquitlam homes for sale'), ('/port-moody-presales', 'Port Moody presales'), ('/port-moody-sold-listings', 'recently sold Port Moody homes')],
  life_h2='Why Port Moody? The Arts, the Water &amp; Brewers Row',
  life_sub=f"Port Moody stays small by geography, and that's part of what makes it distinct.",
  areas=["White Rock", "Surrey", "Burnaby", "New Westminster", "Coquitlam", "Port Coquitlam", "Port Moody", "Delta", "Langley", "Abbotsford"],
  agent_cities='White Rock, Surrey, Burnaby, New Westminster, Coquitlam, Port Coquitlam, Port Moody, Delta, Langley and Abbotsford',
  sub=(f"Port Moody is the smallest of the Tri{NH}Cities and was the original terminus of the Canadian Pacific Railway before the line was extended on to Vancouver. Today it's known as the City of the Arts, with a waterfront centred on Rocky Point Park and a cluster of craft breweries along what locals call Brewers Row. The Millennium Line's Evergreen extension serves the city at Moody Centre and Inlet Centre stations. With hundreds of active listings, prices range widely, from a condo near the station to a home on Heritage Mountain. Whether you're after a <strong>condo near Moody Centre</strong>, a <strong>family home on Heritage Mountain</strong>, or a <strong>character property near Rocky Point</strong>, Port Moody stays smaller by design."),
  faq=[
   ("Is Port Moody a good place to invest in real estate right now?", f"Port Moody's small size can limit new supply compared to its Tri{NH}Cities neighbours, and SkyTrain access near Moody Centre and Inlet Centre stations is a draw for many buyers. Talk to Nader for a current{NH}day read on a specific street."),
   ("What's the property transfer tax on a home in Port Moody, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Port Moody's range spans from condos near Moody Centre station, some near the first{NH}time buyer exemption threshold (up to an $835,000 fair market value), to larger homes on Heritage Mountain that sit above it. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is Port Moody from downtown Vancouver?", f"By car it's roughly 30 to 60 minutes depending on traffic. By transit, take the Millennium Line SkyTrain from Moody Centre or Inlet Centre station, with a transfer for downtown, so check TransLink for current trip times."),
   ("Is Port Moody part of Metro Vancouver?", f"Yes. Port Moody is a member municipality of the Metro Vancouver Regional District, and the smallest of the three Tri{NH}Cities municipalities (Coquitlam, Port Coquitlam, and Port Moody) by both population and land area."),
   ("What school district serves Port Moody?", f"Public schools fall under School District 43, the same district that covers Coquitlam and Port Coquitlam."),
   ("What areas does this Port Moody search cover?", f"This search covers Port Moody, including Moody Centre, Heritage Mountain, Glenayre, College Park, Ioco, and Newport Village."),
  ],
  neigh=[
   ("Moody Centre", f"The city's SkyTrain{NH}connected core, walkable to Rocky Point Park and the Brewers Row craft breweries."),
   ("Heritage Mountain", f"A hillside, family{NH}oriented neighbourhood of larger homes with views."),
   ("Glenayre", f"An established neighbourhood on quiet, tree{NH}lined streets."),
   ("College Park", f"A mix of townhomes and single{NH}family houses near Eagle Ridge Hospital and Port Moody's schools."),
   ("Ioco", f"A small, close{NH}knit community on the city's eastern edge, near Buntzen Lake and Belcarra Regional Park."),
   ("Newport Village", f"A walkable, mixed{NH}use pocket of condos and townhomes built around shops and a public plaza."),
  ],
  life=[
   ("🎨", "The City of the Arts", f"Port Moody's official tagline reflects its arts centre, galleries, and community theatre."),
   ("🚂", "Where the Railway Almost Ended", f"Port Moody was the original terminus of the Canadian Pacific Railway before it was extended to Vancouver."),
   ("🍺", "Brewers Row", f"A cluster of craft breweries along Murray Street has made Port Moody a regional destination for beer lovers."),
   ("🌊", "Rocky Point Park", f"A waterfront park with a pier and splash pad on Burrard Inlet."),
   ("🚇", "Two SkyTrain Stations", f"Moody Centre and Inlet Centre both sit on the Evergreen extension of the Millennium Line."),
   ("🌲", "Buntzen Lake Nearby", f"Just outside the city, Buntzen Lake and Belcarra Regional Park are popular for hiking and swimming."),
   ("📚", "Schools", f"Public schools fall under <strong>School District 43</strong>, shared with Coquitlam and Port Coquitlam."),
   ("🏘️", f"The Smallest of the Tri{NH}Cities", f"Port Moody's small size and hillside geography keep it more compact than its Tri{NH}Cities neighbours."),
  ],
  take=(f"Port Moody is proof that small can still be desirable. It's the smallest of the Tri{NH}Cities, but the combination of Rocky Point Park, the breweries, and two SkyTrain stations punches above its size. As an engineer, I pay attention to the hillside grading on Heritage Mountain and Glenayre in particular, since slope affects everything from drainage to renovation cost. I help my clients understand what they're taking on before they fall for the view."),
)
CONFIGS['richmond'] = dict(
  label='Richmond', page='richmond-listings', hero_word='Homes',
  nearby=[('/burnaby-listings', 'Burnaby homes for sale'), ('/richmond-presales', 'Richmond presales'), ('/richmond-sold-listings', 'recently sold Richmond homes')],
  life_h2='Why Richmond? The Airport, the Delta &amp; Steveston',
  life_sub=f"Richmond's geography and transit access set it apart from the rest of the region.",
  areas=["White Rock", "Surrey", "Richmond", "Burnaby", "New Westminster", "Coquitlam", "Port Coquitlam", "Port Moody", "Delta", "Langley", "Abbotsford"],
  agent_cities='White Rock, Surrey, Richmond, Burnaby, New Westminster, Coquitlam, Port Coquitlam, Port Moody, Delta, Langley and Abbotsford',
  sub=(f"Richmond is one of the largest cities in Metro Vancouver, built on Lulu Island and Sea Island in the Fraser River delta. Much of the city is low{NH}lying and protected by a network of dykes. It is home to Vancouver International Airport, the historic fishing village of Steveston, and the Canada Line, which connects the airport and central Richmond directly to downtown Vancouver. Richmond sits across the Fraser River from Delta, where the George Massey Tunnel is being replaced with a new crossing. With hundreds of active listings, prices range widely, from a condo near the Canada Line to a waterfront home. Whether you're after a <strong>condo near the Canada Line</strong>, a <strong>family home in Richmond West</strong>, or a <strong>character property in Steveston</strong>, Richmond has it."),
  faq=[
   ("Is Richmond a good place to invest in real estate right now?", f"Richmond has direct Canada Line access to both YVR and downtown Vancouver, and a wide mix of condos, townhomes and single{NH}family homes. Talk to Nader for a current{NH}day read on a specific building or area."),
   ("What's the property transfer tax on a home in Richmond, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. Richmond's range spans from condos near the Canada Line, some near the first{NH}time buyer exemption threshold (up to an $835,000 fair market value), to larger single{NH}family homes that sit above it. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is Richmond from downtown Vancouver?", f"By transit, take the Canada Line SkyTrain from a Richmond station directly to downtown Vancouver, so check TransLink for current trip times from your station. By car, travel time depends heavily on the route and traffic."),
   ("Is Richmond part of Metro Vancouver?", f"Yes. Richmond is a member municipality of the Metro Vancouver Regional District, and one of the few cities in the region built almost entirely on river{NH}delta islands."),
   ("What school district serves Richmond?", f"Public schools fall under School District 38 Richmond. Kwantlen Polytechnic University also has a campus in the city."),
   ("What areas does this Richmond search cover?", f"This search covers Richmond, including Steveston, City Centre/Golden Village, Richmond West, Terra Nova, Broadmoor, and Hamilton."),
  ],
  neigh=[
   ("Steveston", f"A historic fishing village anchored by the Gulf of Georgia Cannery National Historic Site and a working fishing fleet, and still one of Richmond's most distinct pockets."),
   ("City Centre / Golden Village", f"Richmond's dense, transit{NH}connected core along No. 3 Road, home to the Aberdeen Centre."),
   ("Richmond West", f"An established, family{NH}oriented area of single{NH}family homes near dyke trails."),
   ("Terra Nova", f"A quiet, park{NH}heavy neighbourhood at the northwest tip of Lulu Island, close to Terra Nova Rural Park."),
   ("Broadmoor", f"An established single{NH}family neighbourhood in central Richmond."),
   ("Hamilton", f"A smaller community on Richmond's east side, with a mix of industrial land and newer residential growth."),
  ],
  life=[
   ("✈️", "Home to YVR", f"Vancouver International Airport sits within Richmond's boundaries, a major driver of the city's economy."),
   ("🚇", "The Canada Line", f"The Canada Line SkyTrain connects Richmond directly to both YVR and downtown Vancouver."),
   ("🎣", f"Steveston's Fishing Fleet", f"Steveston is still home to a working commercial fishing fleet and the Gulf of Georgia Cannery National Historic Site."),
   ("🌙", "The Richmond Night Market", f"A seasonal night market runs in Richmond, a major cultural draw."),
   ("🌊", "Low-Lying and Diked", f"Much of Richmond is low{NH}lying and protected by an extensive network of dykes along the Fraser River."),
   ("🌉", "A New River Crossing", f"The George Massey Tunnel to Delta is being replaced with a new crossing."),
   ("📚", "Schools", f"Public schools fall under <strong>School District 38 Richmond</strong>."),
   ("🛍️", "Golden Village", f"No. 3 Road's Golden Village is a dense stretch of Asian restaurants and shopping."),
  ],
  take=(f"Richmond is a market where geography matters more than almost anywhere else in the region. Much of the city is low{NH}lying, and that shapes everything from foundation type to insurance to how a property is built. As an engineer, that's exactly the kind of detail I dig into before a client makes an offer. Between Steveston's older housing stock and the newer highrises around the Canada Line, the due diligence looks completely different depending on where you're looking."),
)
CONFIGS['southsurrey'] = dict(
  label='South Surrey', page='south-surrey-listings', hero_word='Homes',
  hero_h2='South Surrey Homes for Sale – Estates, Townhomes &amp; Beachside Properties',
  nearby=[('/white-rock-listings', 'White Rock homes for sale'), ('/south-surrey-presales', 'South Surrey presales'), ('/south-surrey-sold-listings', 'recently sold South Surrey homes')],
  life_h2='Why South Surrey? Space, Golf &amp; the Water',
  life_sub=f"South Surrey is known for larger lots, golf courses, and beach access.",
  areas=["White Rock", "Surrey", "South Surrey", "Langley", "Delta", "Richmond", "Burnaby", "New Westminster", "Coquitlam", "Port Coquitlam", "Port Moody", "Abbotsford"],
  agent_cities='White Rock, Surrey, South Surrey, Langley, Delta, Richmond, Burnaby, New Westminster, Coquitlam, Port Coquitlam, Port Moody and Abbotsford',
  sub=(f"South Surrey is one of Surrey's six town centres, on the Semiahmoo Peninsula between the city's northern communities and the U.S. border at the Peace Arch crossing. It's a market built around larger lots, golf courses, and beach access, with a lower{NH}density feel than many parts of Surrey. With hundreds of active listings, prices range widely, from a townhome to a golf{NH}course or waterfront home. Whether you're after a <strong>golf{NH}course home in Morgan Creek</strong>, a <strong>cottage in Crescent Beach</strong>, or a <strong>family home in Grandview Heights</strong>, South Surrey trades density for space."),
  faq=[
   ("Is South Surrey a good place to invest in real estate right now?", f"South Surrey offers a mix of townhomes, condos and single{NH}family homes, with larger lots in many pockets and Highway 99 access to the border and Vancouver. Talk to Nader for a current{NH}day read on a specific street or community."),
   ("What's the property transfer tax on a home in South Surrey, BC?", f"BC's property transfer tax is 1% on the first $200,000, 2% from $200,000 to $2,000,000, 3% from $2,000,000 to $3,000,000, and a further 2% (5% total) on any residential value above $3,000,000. South Surrey's range spans from townhomes and condos, some near the first{NH}time buyer exemption threshold (up to an $835,000 fair market value), to larger homes that sit above it. Use the <a href=\"/cash-to-close\">Cash to Close calculator</a> for an exact number."),
   ("How far is South Surrey from downtown Vancouver?", f"By car it's roughly a 40 to 60 minute drive via Highway 99, depending on the neighbourhood and traffic. There's no SkyTrain station in South Surrey itself, so check TransLink for current transit options."),
   ("Is South Surrey a separate city from Surrey?", f"No. South Surrey is one of Surrey's six town centres, not a separate municipality, but it's searched separately because its housing stock and price points differ from much of the rest of the city."),
   ("What school district serves South Surrey?", f"Public schools fall under School District 36 Surrey, the same district that covers the rest of Surrey."),
   ("What areas does this South Surrey search cover?", f"This search covers South Surrey, including Ocean Park, Crescent Beach, Elgin/Chantrell, Grandview Heights, Morgan Creek, and Sunnyside Park."),
  ],
  neigh=[
   ("Ocean Park", f"An established neighbourhood near the water, known for mature trees and easy beach access."),
   ("Crescent Beach", f"A small beach community reached by crossing the BNSF rail line, with a cottage{NH}town feel."),
   ("Elgin / Chantrell", f"An established area of larger lots and estate{NH}style homes."),
   ("Grandview Heights", f"A newer, fast{NH}growing area of townhomes and single{NH}family homes."),
   ("Morgan Creek", f"A master{NH}planned community built around the Morgan Creek Golf Course."),
   ("Sunnyside Park", f"An established, family{NH}friendly neighbourhood."),
  ],
  life=[
   ("🕊️", "The Peace Arch", f"South Surrey borders the U.S. at the Peace Arch crossing, home to the historic 1921 Peace Arch monument."),
   ("🏖️", "Crescent Beach", f"A small beach community with a summer{NH}cottage feel."),
   ("⛳", "Golf Course Living", f"Morgan Creek and other golf courses anchor some of South Surrey's established communities."),
   ("🌳", "More Space, Fewer Towers", f"South Surrey is known for larger lots and lower{NH}rise streets."),
   ("🛍️", "Semiahmoo Shopping Centre", f"A long{NH}standing retail hub serving South Surrey and White Rock."),
   ("🚶", "Semiahmoo Trail", f"A multi{NH}use trail in South Surrey, popular with walkers and cyclists."),
   ("📚", "Schools", f"Public schools fall under <strong>School District 36 Surrey</strong>, the same district as the rest of the city."),
   ("🚗", "Highway 99 &amp; the Border", f"Highway 99 connects South Surrey to Vancouver and the U.S. border."),
  ],
  take=(f"South Surrey feels different from much of the rest of Surrey, and that's the point. Buyers here are often choosing space, golf courses, or beach access over density. As an engineer, I pay close attention to lot grading and drainage, especially on older streets near the water. I help my clients understand what an older lot actually needs before they commit to it."),
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
    leftovers = re.findall(r'\{[A-Za-z_][A-Za-z_0-9]*\}', re.sub(r'<style>.*?</style>', '', page, flags=re.S))
    if leftovers:
        raise SystemExit(f'ERROR: unrendered placeholder(s) in {PAGE}: {sorted(set(leftovers))}. A string is probably missing its f prefix.')
    open(f'{ROOT}/{PAGE}-improved.html', 'w', encoding='utf8').write(page)
    print('wrote', f'{PAGE}-improved.html', len(page), 'chars | neighbourhood marker:', '<section class="wr-block" aria-labelledby="wr-neigh-title">' in page, '| list elements:', len(re.findall(r'<(?:ul|ol|li)[ >]', page)))
if __name__ == '__main__': render(sys.argv[1])
